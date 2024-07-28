from flask import Blueprint, render_template, request, Response, stream_with_context
from app.chatbot import get_chatbot_response

bp = Blueprint('routes', __name__)

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/api/chat', methods=['POST'])
def chat():
    user_message = request.json['message']

    @stream_with_context
    def generate():
        for chunk in get_chatbot_response(user_message):
            yield chunk

    return Response(generate(), content_type='text/markdown')
