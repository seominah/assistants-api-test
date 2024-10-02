from flask import Blueprint, render_template, request, Response, stream_with_context, session, jsonify
from app.chatbot import get_chatbot_response, create_thread, get_thread_message, delete_thread, get_chat_title, get_file_references, get_all_file_urls
from uuid import uuid4
from fileURL import file_urls

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

    return Response(generate(), content_type='text/text')

# 대표 참고 파일명을 반환하는 API 엔드포인트 추가
@bp.route('/api/chat-title', methods=['GET'])
def api_get_chat_title():
    # `chatbot.py`의 `get_chat_title` 함수 호출하여 타이틀 가져오기
    chat_title = get_chat_title()
    # print("Fetched chat title:", chat_title)  
    
    return jsonify({"chat_title": chat_title})

# 참고 파일 리스트를 반환하는 API 엔드포인트 추가
@bp.route('/api/file-references', methods=['GET'])
def api_get_file_references():
    # `chatbot.py`의 `get_file_references` 함수 호출하여 파일명 가져오기
    file_references = get_file_references()
    # print("Fetched file references:", file_references)  
    
    return jsonify({"file_references": file_references})

# 참고 파일 URL을 반환하는 API 엔드포인트 추가
@bp.route('/api/get-file-url', methods=['GET'])
def api_get_file_url():
    file_name = request.args.get('fileName')  # 요청에서 파일명 가져오기
    
    # 딕셔너리의 키를 순회하면서 파일명에 포함된 키를 찾음
    for key in file_urls:
        if key in file_name:  # 파일명에 키가 포함되는지 확인
            return jsonify({'url': file_urls[key]})  # 해당 키의 URL 반환

    # 해당하는 URL을 찾지 못한 경우
    return jsonify({'error': 'URL not found'}), 404

# 모든 파일 URL을 반환하는 API 엔드포인트 추가
@bp.route('/api/all-file-urls', methods=['GET'])
def api_get_all_file_urls():
    # chatbot.py에서 정의한 get_all_file_urls 함수 호출
    file_urls = get_all_file_urls()
    return jsonify(file_urls)  # 전체 파일 URL 딕셔너리를 JSON으로 반환    