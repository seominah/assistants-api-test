from flask import Blueprint, render_template, request, Response, stream_with_context, session, jsonify
from app.chatbot import get_chatbot_response, create_thread, get_thread_message, delete_thread
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
    print("얏호")
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
