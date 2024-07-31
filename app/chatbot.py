import json
import re
from time import time
from flask import current_app
from openai import OpenAI

def open_ai():
    api_key = current_app.config['OPEN_API_KEY']
    client = OpenAI(api_key=api_key)
    return client

def create_thread():
    client = open_ai()
    thread = client.beta.threads.create()
    print("쓰레디 아이디!! 0번" + thread.id)
    return thread.id

def get_thread_message(thread_id):
    client = open_ai()
    messages = client.beta.threads.messages.list(thread_id=thread_id)
    return messages

def get_chatbot_response(message_req, thread_id):
    client = open_ai()
    assistant_id = current_app.config['ASSISTANTS_ID']

    existed_messages = list(client.beta.threads.messages.list(thread_id))

    print("쓰레디 아이디!! 2번" + thread_id)
    
    if '안녕' in message_req:
        yield "안녕하세요! HR 관련 질문이 있으신가요?"
    else:
        try:
            message = client.beta.threads.messages.create(
                thread_id,
                role="user",
                content=message_req,
            )
            stream = client.beta.threads.runs.create(
                thread_id=thread_id,
                assistant_id=assistant_id,
                stream=True
            )

            for event in stream:
                if event.data.object == "thread.message.delta":
                    for content in event.data.delta.content:
                        if content.type == "text":
                            yield (content.text.value)
        except Exception as e:
            yield f"An error occurred: {str(e)}"