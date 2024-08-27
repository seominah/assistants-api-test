import json
import re
from time import time
from flask import current_app
import openai  # 추가
from openai import OpenAI
from pprint import pprint
import openai

def open_ai():
    api_key = current_app.config['OPEN_API_KEY']
    client = OpenAI(api_key=api_key)
    return client

def create_thread():
    client = open_ai()
    thread = client.beta.threads.create()
    print("쓰레디 아이디!! 0번" + thread.id)
    return thread.id

def delete_thread(thread_id):
    client = open_ai()
    response = client.beta.threads.delete(thread_id)
    print(response)
    return response.deleted

def get_thread_message(thread_id):
    client = open_ai()
    messages = client.beta.threads.messages.list(thread_id=thread_id)
    return messages

def get_chatbot_response(message_req, thread_id):
    client = open_ai()
    assistant_id = current_app.config['ASSISTANTS_ID']

    max_tokens = int(current_app.config['MAX_TOKENS']) # 환경 변수에서 가져온 문자열을 정수로 변환
    model_id = client.beta.assistants.retrieve(assistant_id).model

    print("쓰레디 아이디!! 2번" + thread_id)
    
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

        stream_all = ""
        
        # 토큰 수 계산
        # input_tokens = count_tokens(client, "user", message_req, model=model_id)
        # print(f"Input text token count: {input_tokens.total_tokens}")       


        for event in stream:
            if event.data.object == "thread.message.delta":
                for content in event.data.delta.content:
                    if content.type == "text":
                        stream_all += content.text.value
                        yield (content.text.value)
            elif event.event == "thread.run.step.completed":
                    # 토큰 사용량 로깅
                    usage = event.data.usage
                    print(f"Usage: {usage}")
            elif event.event == "thread.run.incomplete":
                # 토큰 사용량 로깅
                usage = event.data.usage
                print(f"Usage: {usage}")
            elif event.event == "thread.run.step.failed":
                Exception(event.data.last_error.code+" : "+event.data.last_error.message)

        print("---------GPT 답변------------")
        print(stream_all)   
        print("----------------------------")


        if not stream_all.strip(): # 빈 문자열일 경우
            yield "죄송합니다. 응답을 가져오는 데 실패했습니다. 다시 시도해 주세요."



    except openai.RateLimitError as e:
        print(str(e))
        # 토큰 초과 오류 처리
        if 'TPM' in str(e):
            yield "오류: 메시지가 너무 깁니다. 더 짧은 메시지를 입력해주세요."
        else:
            yield f"토큰 초과 오류가 발생했습니다. : {str(e)}"
    except openai.APITimeoutError as e:
        yield f"시간 초과 오류가 발생했습니다. : {str(e)}"
    except openai.BadRequestError as e:
        print(str(e))
        # 토큰 초과 오류 처리
        if 'maximum context length' in str(e):
            yield "오류: 메시지가 너무 깁니다. 더 짧은 메시지를 입력해주세요."
        else:
            yield f"요청메시지 오류가 발생했습니다. : {str(e)}"
    except openai.BadRequestError as e:
        yield f"BadRequestError 오류가 발생했습니다. : {str(e)}"
    except openai.APIError as e:
        yield f"APIError 오류가 발생했습니다. : {str(e)}"
    except openai.OpenAIError as e:
        yield f"OpenAIError 오류가 발생했습니다. : {str(e)}"
    except Exception as e:
        yield f"Exception 오류가 발생했습니다. : {str(e)}"

def count_tokens(client, role, text, model):
    # 토큰 수를 계산하는 함수
    # print(f"role: {role}")
    # print(f"text: {text}")
    # print(f"model: {model}")
    
    response = client.chat.completions.create(model=model, 
                                            messages=[
                                                {"role": role, "content": text}
                                            ])
    # print(f"response: {response}")
    tokens = response.usage
    return tokens   
