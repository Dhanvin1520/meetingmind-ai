import argparse
import os
import logging
from dataclasses import dataclass
from typing import Optional
import numpy as np
import torch
import evaluate
from datasets import load_dataset, DatasetDict
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, DataCollatorForSeq2Seq, Seq2SeqTrainer, Seq2SeqTrainingArguments, EarlyStoppingCallback, set_seed
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class FineTuneConfig:
    model_name: str = 'facebook/bart-large-cnn'
    dataset_name: str = 'edinburghcst/ami'
    output_dir: str = './checkpoints/bart-meeting'
    max_input_length: int = 1024
    max_target_length: int = 256
    num_train_epochs: int = 5
    batch_size: int = 4
    gradient_accumulation_steps: int = 4
    learning_rate: float = 3e-05
    warmup_ratio: float = 0.06
    weight_decay: float = 0.01
    fp16: bool = True
    seed: int = 42
    save_total_limit: int = 2
    eval_steps: int = 500
    logging_steps: int = 100
    load_best_model_at_end: bool = True
    metric_for_best_model: str = 'rouge2'

def load_ami_dataset(config: FineTuneConfig) -> DatasetDict:
    logger.info(f'Loading dataset: {config.dataset_name}')
    try:
        dataset = load_dataset(config.dataset_name, trust_remote_code=True)
        logger.info(f'Dataset loaded. Splits: {list(dataset.keys())}')
        logger.info(f"Train examples: {len(dataset['train'])}")
        return dataset
    except Exception as e:
        logger.error(f'Failed to load {config.dataset_name}: {e}')
        logger.info('Attempting fallback AMI dataset format...')
        dataset = load_dataset('ami', 'headset-single', trust_remote_code=True)
        return dataset

def build_ami_examples(dataset: DatasetDict) -> DatasetDict:

    def normalise_example(example):
        document = example.get('transcript') or example.get('text') or example.get('words') or ''
        summary = example.get('summary') or example.get('abstractive_synopsis') or example.get('extractive_synopsis') or ''
        if isinstance(document, list):
            document = ' '.join((str(w) for w in document if w))
        if isinstance(summary, list):
            summary = ' '.join((str(s) for s in summary if s))
        return {'document': str(document).strip(), 'summary': str(summary).strip()}
    return dataset.map(normalise_example, remove_columns=dataset['train'].column_names)

def filter_empty_examples(dataset: DatasetDict) -> DatasetDict:

    def is_valid(example):
        return len(example['document']) > 50 and len(example['summary']) > 10
    filtered = {split: dataset[split].filter(is_valid) for split in dataset.keys()}
    return DatasetDict(filtered)

def get_tokenise_fn(tokenizer, config: FineTuneConfig):
    prefix = ''

    def tokenise(examples):
        inputs = [prefix + doc for doc in examples['document']]
        model_inputs = tokenizer(inputs, max_length=config.max_input_length, padding='max_length', truncation=True)
        labels = tokenizer(text_target=examples['summary'], max_length=config.max_target_length, padding='max_length', truncation=True)
        labels['input_ids'] = [[l if l != tokenizer.pad_token_id else -100 for l in label] for label in labels['input_ids']]
        model_inputs['labels'] = labels['input_ids']
        return model_inputs
    return tokenise

def build_compute_metrics(tokenizer):
    rouge = evaluate.load('rouge')

    def compute_metrics(eval_pred):
        (predictions, labels) = eval_pred
        decoded_preds = tokenizer.batch_decode(predictions, skip_special_tokens=True)
        labels = np.where(labels != -100, labels, tokenizer.pad_token_id)
        decoded_labels = tokenizer.batch_decode(labels, skip_special_tokens=True)
        decoded_preds = [p.strip() for p in decoded_preds]
        decoded_labels = [l.strip() for l in decoded_labels]
        result = rouge.compute(predictions=decoded_preds, references=decoded_labels, use_stemmer=True)
        result = {k: round(v * 100, 4) for (k, v) in result.items()}
        prediction_lens = [np.count_nonzero(pred != tokenizer.pad_token_id) for pred in predictions]
        result['gen_len'] = np.mean(prediction_lens)
        logger.info(f'Eval metrics: {result}')
        return result
    return compute_metrics

def fine_tune(config: FineTuneConfig):
    set_seed(config.seed)
    logger.info(f'Starting fine-tuning with config: {config}')
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    logger.info(f'Using device: {device}')
    if device == 'cpu':
        logger.warning('No GPU detected. Fine-tuning on CPU will be extremely slow. Consider using Google Colab (A100) or a cloud GPU instance.')
        config.fp16 = False
    logger.info(f'Loading tokeniser: {config.model_name}')
    tokenizer = AutoTokenizer.from_pretrained(config.model_name)
    logger.info(f'Loading model: {config.model_name}')
    model = AutoModelForSeq2SeqLM.from_pretrained(config.model_name, torch_dtype=torch.float16 if config.fp16 and device == 'cuda' else torch.float32)
    model.gradient_checkpointing_enable()
    raw_dataset = load_ami_dataset(config)
    normalised = build_ami_examples(raw_dataset)
    clean_dataset = filter_empty_examples(normalised)
    logger.info(f'Clean dataset sizes: { {k: len(v) for (k, v) in clean_dataset.items()}}')
    tokenise_fn = get_tokenise_fn(tokenizer, config)
    tokenised_dataset = clean_dataset.map(tokenise_fn, batched=True, batch_size=64, remove_columns=['document', 'summary'], desc='Tokenising')
    tokenised_dataset.set_format('torch')
    data_collator = DataCollatorForSeq2Seq(tokenizer=tokenizer, model=model, label_pad_token_id=-100, pad_to_multiple_of=8 if config.fp16 else None)
    os.makedirs(config.output_dir, exist_ok=True)
    training_args = Seq2SeqTrainingArguments(output_dir=config.output_dir, evaluation_strategy='steps', eval_steps=config.eval_steps, save_strategy='steps', save_steps=config.eval_steps, logging_strategy='steps', logging_steps=config.logging_steps, learning_rate=config.learning_rate, per_device_train_batch_size=config.batch_size, per_device_eval_batch_size=config.batch_size, gradient_accumulation_steps=config.gradient_accumulation_steps, weight_decay=config.weight_decay, num_train_epochs=config.num_train_epochs, warmup_ratio=config.warmup_ratio, predict_with_generate=True, generation_max_length=config.max_target_length, fp16=config.fp16, load_best_model_at_end=config.load_best_model_at_end, metric_for_best_model=config.metric_for_best_model, greater_is_better=True, save_total_limit=config.save_total_limit, report_to='none', dataloader_num_workers=4, group_by_length=True, seed=config.seed)
    eval_split = 'validation' if 'validation' in tokenised_dataset else 'test'
    trainer = Seq2SeqTrainer(model=model, args=training_args, train_dataset=tokenised_dataset['train'], eval_dataset=tokenised_dataset[eval_split], tokenizer=tokenizer, data_collator=data_collator, compute_metrics=build_compute_metrics(tokenizer), callbacks=[EarlyStoppingCallback(early_stopping_patience=3)])
    logger.info('=== Starting training ===')
    trainer.train()
    final_path = os.path.join(config.output_dir, 'final')
    trainer.save_model(final_path)
    tokenizer.save_pretrained(final_path)
    logger.info(f'Model saved to: {final_path}')
    logger.info('=== Fine-tuning complete ===')
    return final_path

def parse_args() -> FineTuneConfig:
    parser = argparse.ArgumentParser(description='Fine-tune BART on AMI Meeting Corpus')
    parser.add_argument('--model_name', default='facebook/bart-large-cnn')
    parser.add_argument('--dataset_name', default='edinburghcst/ami')
    parser.add_argument('--output_dir', default='./checkpoints/bart-meeting')
    parser.add_argument('--max_input_length', type=int, default=1024)
    parser.add_argument('--max_target_length', type=int, default=256)
    parser.add_argument('--num_train_epochs', type=int, default=5)
    parser.add_argument('--batch_size', type=int, default=4)
    parser.add_argument('--gradient_accumulation_steps', type=int, default=4)
    parser.add_argument('--learning_rate', type=float, default=3e-05)
    parser.add_argument('--warmup_ratio', type=float, default=0.06)
    parser.add_argument('--fp16', action='store_true', default=True)
    parser.add_argument('--seed', type=int, default=42)
    args = parser.parse_args()
    return FineTuneConfig(model_name=args.model_name, dataset_name=args.dataset_name, output_dir=args.output_dir, max_input_length=args.max_input_length, max_target_length=args.max_target_length, num_train_epochs=args.num_train_epochs, batch_size=args.batch_size, gradient_accumulation_steps=args.gradient_accumulation_steps, learning_rate=args.learning_rate, warmup_ratio=args.warmup_ratio, fp16=args.fp16, seed=args.seed)
if __name__ == '__main__':
    config = parse_args()
    fine_tune(config)