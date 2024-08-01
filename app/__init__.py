from flask import Flask, session
from flask_cors import CORS

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    CORS(app)
    app.config.from_object('config.Config')

    @app.before_request
    def clear_session():
        session.clear()

    from app import routes
    app.register_blueprint(routes.bp)
    
    return app