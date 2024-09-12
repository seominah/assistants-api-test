import json
import re
from time import time
from flask import Flask, jsonify, current_app
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

def get_chat_title():
    return chat_title

def get_file_references():
    # 중복을 제거하기 위해 set 사용
    unique_file_names = set()

    for file_name in file_names:
        # 정규 표현식을 사용하여 숫자, 점(.), 공백을 제거
        pure_name = re.sub(r'^\d+\.\s*', '', file_name).strip()  # 앞의 숫자, 점(.) 그리고 공백 제거
        pure_name = re.sub(r'\.\w+$', '', pure_name)  # 확장자 제거 (예: .txt)
        unique_file_names.add(pure_name)

    return list(unique_file_names)
        

def get_chatbot_response(message_req, thread_id):
    global chat_title  # chat_title을 전역 변수로 사용
    global file_names  # file_references를 전역 변수로 사용
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

        file_references = set()  # 파일 참조 정보를 중복 없이 수집하기 위한 집합
        stream_all = ""
        
        # 토큰 수 계산
        # input_tokens = count_tokens(client, "user", message_req, model=model_id)
        # print(f"Input text token count: {input_tokens.total_tokens}")       

        for event in stream:
            if event.data.object == "thread.message.delta":
                for content in event.data.delta.content:
                    if content.type == "text":
                        if content.text.annotations:   # 참고하는 파일 정보 (출처정보)  text='【57:6†source】'  
                            print("--File annotations--")
                            print(content.text.annotations)
                            print("---------")
                            # annotations에서 파일 ID나 파일 이름 추출
                            for annotation in content.text.annotations:
                                if annotation.type == 'file_citation' and annotation.file_citation.file_id:
                                    file_id = annotation.file_citation.file_id
                                    file_references.add(file_id)
                        else:
                            stream_all += content.text.value
                            yield (content.text.value)
            elif event.event == "thread.run.step.completed":
                    # 토큰 사용량 로깅
                    usage = event.data.usage
                    # print(f"Usage: {usage}")
            elif event.event == "thread.run.incomplete":
                # 토큰 사용량 로깅
                usage = event.data.usage
                # print(f"Usage: {usage}")
            elif event.event == "thread.run.step.failed":
                Exception(event.data.last_error.code+" : "+event.data.last_error.message)
        
        # 파일명 가져오기
        file_names = get_file_names(file_references)

        # 참고파일 중 첫번째 파일명 가져오기
        chat_title = get_primary_reference_file_name(file_names)

        print("---------GPT 답변------------")
        print(stream_all)   
        print("---------참고파일------------")
        print("Referenced Files:", file_names)  # 수집된 파일 참조 정보 출력
        print("chat title:", chat_title)  # 참고파일 중 첫번째 파일명으로 제목 설정
        print("-----------------------------")


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
    except openai.APIError as e:
        yield f"APIError 오류가 발생했습니다. : {str(e)}"
    except openai.OpenAIError as e:
        yield f"OpenAIError 오류가 발생했습니다. : {str(e)}"
    except Exception as e:
        yield f"Exception 오류가 발생했습니다. : {str(e)}"

def count_tokens(client, role, text, model):
    # 토큰 수를 계산하는 함수
    print(f"role: {role}")
    print(f"text: {text}")
    print(f"model: {model}")
    
    response = client.chat.completions.create(model=model, 
                                            messages=[
                                                {"role": role, "content": text}
                                            ])
    print(f"response: {response}")
    tokens = response.usage
    return tokens   

# 여러 파일 ID에 대한 파일명을 가져오는 함수
def get_file_names(file_ids):    
    client = open_ai()
    file_names = {}

    for file_id in file_ids:
        try:
            # 파일 ID를 사용하여 파일 정보 조회
            file = client.files.retrieve(file_id)
            file_names[file_id] = file.filename
        except openai.InvalidRequestError as e:
            print(f"Invalid request for file_id {file_id}: {str(e)}")
            file_names[file_id] = None
        except openai.APIConnectionError as e:
            print(f"API connection error for file_id {file_id}: {str(e)}")
            file_names[file_id] = None
        except openai.AuthenticationError as e:
            print(f"Authentication error for file_id {file_id}: {str(e)}")
            file_names[file_id] = None
        except Exception as e:
            print(f"파일 정보를 가져오는 도중 오류 발생 for file_id {file_id}: {str(e)}")
            file_names[file_id] = None

    print("-----------File Info-----------")
    print(file_names)
    print("-------------------------------")

    # 딕셔너리 값에서 파일명만 추출
    file_names = list(file_names.values())
    return file_names

# 여러 파일명을 저장한 딕셔너리에서 첫 번째 파일명을 추출하고
# 숫자와 확장자를 제거한 대표 참고 파일명을 반환하는 함수
def get_primary_reference_file_name(file_names):
    # 딕셔너리가 비어있지 않은 경우에만 처리
    if not file_names:  # 리스트가 비어있지 않은 경우에만 처리
        return None

    # 첫 번째 파일명 가져오기
    first_file_name = file_names[0]

    # 숫자와 확장자를 제거한 순수 파일명 추출
    pure_file_name = re.sub(r'^\d+\.\s*', '', first_file_name)  # 파일명 앞부분의 "99. " 형태 제거
    pure_file_name = re.sub(r'\.\w+$', '', pure_file_name)  # 확장자 제거

    # 파일명이 빈 문자열이 아닌 경우 반환, 그렇지 않으면 원래 파일명을 반환
    return pure_file_name.strip() if pure_file_name.strip() else first_file_name  # 양쪽 공백 제거
