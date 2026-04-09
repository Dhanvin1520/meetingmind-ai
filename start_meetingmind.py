import os
import subprocess
import sys
import time
import webbrowser
import socket

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def start_backend():
    print('🚀 Starting MeetingMind Backend...')
    if is_port_in_use(8000):
        print('⚠️ Port 8000 is already in use. Is the backend already running?')
        webbrowser.open('http://localhost:8000/docs')
        return
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_python = os.path.join(base_dir, 'backend', 'venv', 'bin', 'python')
    if not os.path.exists(venv_python):
        print(f'❌ Could not find virtual environment at {venv_python}')
        print('Please ensure you have set up the project correctly.')
        return
    print('📦 Loading AI Model (BART) and connecting to MongoDB...')
    cmd = [venv_python, '-m', 'uvicorn', 'backend.main:app', '--host', '0.0.0.0', '--port', '8000']
    try:
        process = subprocess.Popen(cmd, cwd=base_dir, env={**os.environ, 'PYTHONPATH': base_dir})
        print('\n⏳ Waiting for server to initialize...')
        for _ in range(30):
            time.sleep(2)
            if is_port_in_use(8000):
                print('✅ Backend is ONLINE!')
                webbrowser.open('http://localhost:8000/health')
                break
        else:
            print('❌ Backend failed to start in time. Check the logs.')
    except Exception as e:
        print(f'❌ Error starting backend: {e}')
if __name__ == '__main__':
    start_backend()
    print('\nPress Ctrl+C to stop the backend.')