import logging
import re
from typing import Optional
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
logger = logging.getLogger(__name__)
_ACTION_PATTERNS = ['(?P<owner>[A-Z][a-z]+(?:\\s[A-Z][a-z]+)?)\\s+will\\s+(?P<desc>[^.!?]+)[.!?]', '(?:ACTION|Action item)[:\\-–]\\s*(?P<owner>[A-Z][a-z]+)?\\s*[:\\-–]?\\s*(?P<desc>[^.!?\\n]+)', '[-•]\\s*(?P<desc>[^().\\n]+)\\s*\\((?P<owner>[A-Z][a-z]+)\\)']
_DECISION_PATTERNS = ['(?:decided|agreed|resolved|concluded)\\s+(?:to\\s+)?(?P<dec>[^.!?\\n]+)[.!?]', '(?:DECISION|Decision)[:\\-–]\\s*(?P<dec>[^.!?\\n]+)']

class SummarisationModel:
    _instance: Optional['SummarisationModel'] = None

    def __init__(self, checkpoint_path: str):
        self.checkpoint_path = checkpoint_path
        self._pipe = None

    @classmethod
    def get_instance(cls, checkpoint_path: str) -> 'SummarisationModel':
        if cls._instance is None:
            cls._instance = cls(checkpoint_path)
            cls._instance._load()
        return cls._instance

    def _load(self):
        logger.info(f'Loading model from: {self.checkpoint_path}')
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if torch.cuda.is_available() else torch.float32
        self.tokenizer = AutoTokenizer.from_pretrained(self.checkpoint_path)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.checkpoint_path, torch_dtype=dtype).to(self.device)
        logger.info('Model loaded successfully.')

    def _generate_raw_summary(self, transcript: str) -> str:
        words = transcript.split()
        if len(words) > 750:
            logger.warning(f'Transcript too long ({len(words)} words). Chunking to last 750 words for summary generation.')
            words = words[-750:]
        truncated = ' '.join(words)
        inputs = self.tokenizer([truncated], max_length=1024, return_tensors='pt', truncation=True).to(self.device)
        summary_ids = self.model.generate(inputs['input_ids'], max_length=256, min_length=80, num_beams=4, early_stopping=True, no_repeat_ngram_size=3, length_penalty=2.0)
        return self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    @staticmethod
    def _extract_tldr(summary: str) -> str:
        sentences = re.split('(?<=[.!?])\\s+', summary.strip())
        return sentences[0] if sentences else summary[:100]

    @staticmethod
    def _extract_action_items(text: str, participant_names: Optional[list]=None) -> list[dict]:
        items = []
        seen = set()
        for pattern in _ACTION_PATTERNS:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                desc = match.group('desc').strip()
                try:
                    owner = match.group('owner')
                except IndexError:
                    owner = None
                if desc and desc not in seen and (len(desc) > 5):
                    seen.add(desc)
                    if not owner and participant_names:
                        for name in participant_names:
                            if name.lower() in desc.lower():
                                owner = name
                                break
                    items.append({'description': desc, 'owner': owner, 'due_date': None})
        if not items and len(text) > 50:
            items.append({'description': 'Review and follow up on discussion points from this meeting', 'owner': None, 'due_date': None})
        return items[:10]

    @staticmethod
    def _extract_decisions(text: str) -> list[str]:
        decisions = []
        seen = set()
        for pattern in _DECISION_PATTERNS:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                dec = match.group('dec').strip()
                if dec and dec not in seen and (len(dec) > 5):
                    seen.add(dec)
                    decisions.append(dec)
        return decisions[:5]

    def generate_summary(self, transcript: str, participant_names: Optional[list]=None) -> dict:
        if not transcript or len(transcript.strip()) < 20:
            return {'tldr': 'No transcript available.', 'summary': 'The meeting transcript was empty or too short to summarise.', 'action_items': [], 'key_decisions': []}
        raw = self._generate_raw_summary(transcript)
        logger.info(f'Raw summary ({len(raw)} chars): {raw[:200]}...')
        return {'tldr': self._extract_tldr(raw), 'summary': raw, 'action_items': self._extract_action_items(raw, participant_names), 'key_decisions': self._extract_decisions(raw)}