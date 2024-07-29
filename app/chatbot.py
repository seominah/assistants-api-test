import json
from time import time
from flask import current_app
from openai import OpenAI

def get_chatbot_response(message_req):
    api_key = current_app.config['OPEN_API_KEY']
    client = OpenAI(api_key=api_key)
    assistant_id = current_app.config['ASSISTANTS_ID']
    thread_id = current_app.config['THREAD_ID']
    message_id="msg_2wtmI2da7pQsUbRAeHqGjbTW"
    run_id="run_irfQeNOrbdOEhdw445LWzY6b"

    existed_messages = list(client.beta.threads.messages.list(thread_id))
    
    if '안녕' in message_req:
        yield "안녕하세요! HR 관련 질문이 있으신가요?"
    elif '급여' in message_req:
        yield "급여 관련 문의는 개인정보이므로 인사팀에 직접 문의해주시기 바랍니다."
    else:
        user_message_index = -1

        for index, message in enumerate(existed_messages):
            if message.role == "user" and message_req in message.content[0].text.value:
                user_message_index = index
                break

        if user_message_index > -1:
            yield existed_messages[(user_message_index - 1)].content[0].text.value + "\n"
        else:
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