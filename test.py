from re import S
from traceback import print_tb
from dotenv import load_dotenv
import os
from openai import OpenAI

load_dotenv()
OPEN_API_KEY=os.environ['OPEN_API_KEY']
assistant_id=os.environ['ASSISTANTS_ID']
thread_id=os.environ['THREAD_ID']
message_id="msg_2wtmI2da7pQsUbRAeHqGjbTW"
run_id="run_irfQeNOrbdOEhdw445LWzY6b"

client = OpenAI(api_key=OPEN_API_KEY)
# 1. 어시스턴트 생성
# 1-1) 어시스턴트를 생성하면서 지시사항, 모델, 툴 등을 설정할 수 있다.
# assistant = client.beta.assistants.create(
#     name="어시스턴트 이름",
#     instructions="지시사항",
#     tools=[{"type": "code_interpreter"}],
#     model="gpt-4o",
# )


# 2. 쓰레드 생성 
# 2-1). 어시스턴트와 쓰레드는 개별적이다. 쓰레드를 만든 후 RUN시킬때 특정 어시스턴트와 쓰레드를 연결할 수 있다.
# thread = client.beta.threads.create()


# 3. 메세지 생성 
# 3-1). 메세지 생성 후 RUN을 해주어야 실행됨
# 3-2). 현재 어이스턴트 API는 베타버전으로, Assistants API의 메세지의 role은 user만 가능
# 3-3). 특정 쓰레드 내에서 메세지를 생성하는 것것
# message = client.beta.threads.messages.create(
#   thread_id=thread_id,
#   role="user",
#   content="강사료 지급기준에 대해 알려줘."
# )

# 3-4) 메세지 삭제 
# deleted_message = client.beta.threads.messages.delete(
#   message_id="msg_Wu96ATWOrNp5mD0t3TOD14Mu",
#   thread_id=thread_id,
# )

# 4. 실행
# 4-1)각 메세지를 실행 시킬 때 마다 instructions, tool 등을 추가할 수 있다. API 문서 확인
# 4-2) 실행된 run_id로 상태를 모니터링 할 수 있다. 
# 4-3) status 가 completed가 되어야 답변이 완료된 것으로 상태를 계속 확인해야 한다.
# run = client.beta.threads.runs.create_and_poll(
#   thread_id=thread_id,
#   assistant_id=assistant_id,
#   instructions="Please address the user as Jane Doe. The user has a premium account."
# )
# print(run)


# TIP1) 특정 쓰레드의 메세지 불러오기
# thread_messages = client.beta.threads.messages.list(thread_id)
# print(thread_messages.data)

# for i in thread_messages:
#   if (i.role == 'user'):
#     print(i.content[0].text.value)
#     print(i.id)

# message_ls = list(client.beta.threads.messages.list(thread_id))
# # print(message_ls)

# for ms in message_ls:
#     print(ms.id)
#     print("\n")
#     deleted_message = client.beta.threads.messages.delete(
#       message_id=ms.id,
#       thread_id=thread_id,
#     )

# runs = client.beta.threads.runs.list(
#   thread_id
# )

# for r in runs:
#     print(r)
#     client.beta.threads.runs.cancel(
#         thread_id=thread_id,
#         run_id=r.id
#     )

# for r in runs:
#     client.beta.threads.runs.cancel(
#         thread_id=thread_id,
#         run_id=r.id
#     )


# 5. 벡터 스토리지