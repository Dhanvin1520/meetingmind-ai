import requests
import json
import time
API_BASE = 'http://127.0.0.1:8000'

def run_simulation():
    print('--- Starting MeetingMind End-to-End Simulation ---')
    print('\n1. Starting session...')
    resp = requests.post(f'{API_BASE}/session/start', json={'meeting_title': 'AI Product Strategy Sync', 'participant_names': ['Alice', 'Bob', 'Charlie']})
    session_id = resp.json()['session_id']
    print(f'Session started: {session_id}')
    chunks = ["Welcome everyone. Today we are discussing the integration of BART for real-time summarization. Alice, what's the status of the frontend?", 'Alice here. The extension popup is mostly done. We are now working on the Web Speech API integration for Google Meet.', "Bob here. I've finished the backend routes and MongoDB schema. The model is loading correctly on CPU for now.", "Great. Let's decide to use a 30-second window for each transcript chunk. Charlie, please prepare the documentation by Friday.", "Will do. That's all from my side."]
    for (i, text) in enumerate(chunks):
        print(f'Sending chunk {i}...')
        requests.post(f'{API_BASE}/transcript/chunk', json={'session_id': session_id, 'chunk_index': i, 'text': text, 'timestamp_start': i * 30.0, 'timestamp_end': (i + 1) * 30.0})
    print('\n3. Stopping session...')
    requests.post(f'{API_BASE}/session/{session_id}/stop')
    print('\n4. Generating AI Summary (BART Model)...')
    start_time = time.time()
    resp = requests.post(f'{API_BASE}/summary/generate', json={'session_id': session_id})
    duration = time.time() - start_time
    summary = resp.json()
    print(f'\nSummary Generated in {duration:.2f}s:')
    print('-' * 40)
    print(f"TL;DR: {summary['tldr']}")
    print(f'\nKey Decisions:')
    for d in summary['key_decisions']:
        print(f'- {d}')
    print(f'\nAction Items:')
    for ai in summary['action_items']:
        owner = f" ({ai['owner']})" if ai['owner'] else ''
        print(f"- {ai['description']}{owner}")
    print('-' * 40)
if __name__ == '__main__':
    run_simulation()