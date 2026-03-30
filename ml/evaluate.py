import argparse
import logging
import time
import numpy as np
import torch
import evaluate
from datasets import load_dataset
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from tqdm import tqdm
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
BASELINE_MODEL = 'facebook/bart-large-cnn'
MAX_INPUT_TOKENS = 1024
MAX_OUTPUT_TOKENS = 256

def load_test_examples(dataset_name: str='edinburghcst/ami', n: int=100):
    logger.info('Loading AMI test split...')
    try:
        dataset = load_dataset(dataset_name, trust_remote_code=True)
        split = 'test' if 'test' in dataset else list(dataset.keys())[-1]
        raw = dataset[split]
    except Exception:
        logger.warning("Falling back to 'ami' headset-single config...")
        dataset = load_dataset('ami', 'headset-single', trust_remote_code=True)
        split = 'test' if 'test' in dataset else list(dataset.keys())[-1]
        raw = dataset[split]
    examples = []
    for ex in raw:
        doc = ex.get('transcript') or ex.get('text') or ex.get('words') or ''
        ref = ex.get('summary') or ex.get('abstractive_synopsis') or ''
        if isinstance(doc, list):
            doc = ' '.join((str(w) for w in doc if w))
        if isinstance(ref, list):
            ref = ' '.join((str(s) for s in ref if s))
        (doc, ref) = (str(doc).strip(), str(ref).strip())
        if len(doc) > 50 and len(ref) > 10:
            examples.append({'document': doc, 'summary': ref})
        if len(examples) >= n:
            break
    logger.info(f'Loaded {len(examples)} test examples.')
    return examples

def run_inference(model_name_or_path: str, examples: list, label: str) -> tuple:
    logger.info(f'[{label}] Loading model from: {model_name_or_path}')
    device = 0 if torch.cuda.is_available() else -1
    summariser = pipeline('summarization', model=model_name_or_path, tokenizer=model_name_or_path, device=device, torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32)
    predictions = []
    start = time.time()
    for ex in tqdm(examples, desc=f'{label} inference'):
        tokens = ex['document'].split()[:800]
        text = ' '.join(tokens)
        try:
            out = summariser(text, max_length=MAX_OUTPUT_TOKENS, min_length=40, do_sample=False, no_repeat_ngram_size=3)
            predictions.append(out[0]['summary_text'])
        except Exception as e:
            logger.warning(f'Inference failed for example: {e}')
            predictions.append('')
    elapsed = time.time() - start
    return (predictions, elapsed)

def compute_rouge(predictions: list, references: list) -> dict:
    rouge = evaluate.load('rouge')
    result = rouge.compute(predictions=predictions, references=references, use_stemmer=True)
    return {k: round(v * 100, 2) for (k, v) in result.items()}

def print_comparison(fine_tuned: dict, baseline: dict, ft_time: float, bl_time: float, n: int):
    print('\n' + '=' * 70)
    print(f'  MeetingMind — ROUGE Evaluation on {n} AMI test examples')
    print('=' * 70)
    print(f"{'Metric':<15} {'Fine-Tuned (ours)':<22} {'Baseline (zero-shot)':<22}")
    print('-' * 70)
    for metric in ['rouge1', 'rouge2', 'rougeL', 'rougeLsum']:
        ft_val = fine_tuned.get(metric, 0.0)
        bl_val = baseline.get(metric, 0.0)
        diff = ft_val - bl_val
        marker = '▲' if diff > 0 else '▼' if diff < 0 else '='
        print(f'{metric:<15} {ft_val:<22.2f} {bl_val:<22.2f} {marker} {abs(diff):.2f}')
    print('-' * 70)
    print(f"{'Throughput':<15} {n / ft_time:<22.1f} {n / bl_time:<22.1f} examples/sec")
    print('=' * 70)
    avg_diff = np.mean([fine_tuned.get(m, 0) - baseline.get(m, 0) for m in ['rouge1', 'rouge2', 'rougeL']])
    if avg_diff > 0:
        print(f'\n✅ Fine-tuned model outperforms baseline by avg {avg_diff:.2f} ROUGE points.')
    else:
        print(f'\n⚠️  Baseline outperforms fine-tuned by avg {abs(avg_diff):.2f} ROUGE points.')
        print('   Consider: more epochs, larger dataset split, or lower learning rate.')
    print()

def main():
    parser = argparse.ArgumentParser(description='Evaluate fine-tuned BART vs baseline')
    parser.add_argument('--checkpoint', required=True, help='Path to fine-tuned checkpoint')
    parser.add_argument('--compare-baseline', action='store_true', default=True)
    parser.add_argument('--n-examples', type=int, default=100)
    parser.add_argument('--dataset', default='edinburghcst/ami')
    args = parser.parse_args()
    examples = load_test_examples(args.dataset, n=args.n_examples)
    references = [ex['summary'] for ex in examples]
    (ft_preds, ft_time) = run_inference(args.checkpoint, examples, 'Fine-Tuned')
    ft_rouge = compute_rouge(ft_preds, references)
    logger.info(f'Fine-tuned ROUGE: {ft_rouge}')
    if args.compare_baseline:
        (bl_preds, bl_time) = run_inference(BASELINE_MODEL, examples, 'Baseline')
        bl_rouge = compute_rouge(bl_preds, references)
        logger.info(f'Baseline ROUGE: {bl_rouge}')
        print_comparison(ft_rouge, bl_rouge, ft_time, bl_time, len(examples))
    else:
        print('\nFine-Tuned ROUGE scores:')
        for (k, v) in ft_rouge.items():
            print(f'  {k}: {v:.2f}')
if __name__ == '__main__':
    main()