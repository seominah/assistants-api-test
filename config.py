from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    OPEN_API_KEY = os.environ.get('OPEN_API_KEY')
    ASSISTANTS_ID = os.environ.get('ASSISTANTS_ID')
    THREAD_ID = os.environ.get('THREAD_ID')
    MAX_TOKENS = os.environ.get('MAX_TOKENS')