from flask import Blueprint, render_template, request, Response, stream_with_context, session, jsonify
from app.chatbot import get_chatbot_response, create_thread, get_thread_message, delete_thread, get_chat_title, get_file_references
from uuid import uuid4

bp = Blueprint('routes', __name__)

def generate_session_id():
    return str(uuid4())

@bp.route('/')
def index():
    if "username" in session:
        session_id = session["username"]
        thread_id = session.get("thread_id", [])
        messages = []
        if thread_id:
            messages = get_thread_message(thread_id)
        return render_template('index.html', session_id=session_id, thread_id=thread_id, messages=messages)
    else:
        session_id = generate_session_id()
        session["username"] = session_id
        thread_id = create_thread()
        session["thread_id"] = thread_id
        return render_template('index.html', session_id=session_id, thread_id=thread_id, messages=[])

@bp.route('/api/chat/delete', methods=['POST'])
def delete_chat():
    thread_id = request.json['newThreadId']
    print(thread_id)
    return jsonify({'thread_id': delete_thread(thread_id)})


@bp.route('/api/thread/new')
def new_thread():
    print("new_thread!!!")
    return jsonify({'thread_id': create_thread()})

@bp.route('/api/chat', methods=['POST'])
def chat():
    print(request.json)
    user_message = request.json['message']
    thread_id = request.json['threadId']

    @stream_with_context
    def generate():
        for chunk in get_chatbot_response(user_message, thread_id):
            yield chunk

    return Response(generate(), content_type='text/markdown')

# 대표 참고 파일명을 반환하는 API 엔드포인트 추가
@bp.route('/api/chat-title', methods=['GET'])
def api_get_chat_title():
    # `chatbot.py`의 `get_chat_title` 함수 호출하여 타이틀 가져오기
    chat_title = get_chat_title()
    # print("Fetched chat title:", chat_title)  # 디버깅을 위한 로그 추가
    
    return jsonify({"chat_title": chat_title})

# 참고 파일 리스트를 반환하는 API 엔드포인트 추가
@bp.route('/api/file-references', methods=['GET'])
def api_get_file_references():
    # `chatbot.py`의 `get_chat_title` 함수 호출하여 타이틀 가져오기
    file_references = get_file_references()
    print("Fetched file references:", file_references)  # 디버깅을 위한 로그 추가
    
    return jsonify({"file_references": file_references})
