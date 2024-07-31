import json
from time import time
from flask import current_app
import openai  # 추가
from openai import OpenAI
from pprint import pprint

def get_chatbot_response(message_req):
    api_key = current_app.config['OPEN_API_KEY']
    client = OpenAI(api_key=api_key)
    assistant_id = current_app.config['ASSISTANTS_ID']
    thread_id = current_app.config['THREAD_ID']
    max_tokens = int(current_app.config['MAX_TOKENS']) # 환경 변수에서 가져온 문자열을 정수로 변환
    message_id="msg_2wtmI2da7pQsUbRAeHqGjbTW"
    run_id="run_irfQeNOrbdOEhdw445LWzY6b"
    model_id = client.beta.assistants.retrieve(assistant_id).model
    
    existed_messages = list(client.beta.threads.messages.list(thread_id))

    if '안녕' in message_req:
        yield "안녕하세요! HR 관련 질문이 있으신가요?"
    else:
        try:
            # for index, message in enumerate(existed_messages):
            #     if message.role == "user" and message_req in message.content[0].text.value:
            #         user_message_index = index
            #         break

            # if user_message_index > -1:
            #     yield existed_messages[(user_message_index - 1)].content[0].text.value + "\n"
            # else:
            message = client.beta.threads.messages.create(
                thread_id,
                role="user",
                content=message_req,
            )

            stream = client.beta.threads.runs.create(
                thread_id=thread_id,
                assistant_id=assistant_id,
                max_prompt_tokens=max_tokens,
                stream=True
            )
            stream_all = ""
            
            # 토큰 수 계산
            input_tokens = count_tokens(client, "user", message_req, model=model_id)
            print(f"Input text token count: {input_tokens.total_tokens}")          

            for event in stream:
                print(event)
                print("\n\n")

                # event.data.object 
                # "thread.message" : 전체 답변 메시지
                # "thread.message.delta" : 답변 메시지 글자단위

                if event.data.object == "thread.message.delta":
                    for content in event.data.delta.content:
                        if content.type == "text":
                            stream_all += content.text.value
                            yield (content.text.value)
                        # elif content.type == "tool_calls":
                        #     yield (content.text.value)
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

            print(stream_all)   

            # 토큰 수 계산
            # output_tokens = count_tokens(client, "assistant", stream_all, model=model_id)
            # print(f"Output text token count: {output_tokens}")  
            
            # prompt_tokens = output_tokens.prompt_tokens
            # completion_tokens = output_tokens.completion_tokens
            # total_tokens = output_tokens.total_tokens
            # print(f"prompt_tokens: {prompt_tokens}")
            # print(f"prompt_tokens: {completion_tokens}")
            # print(f"total_tokens: {total_tokens}")
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