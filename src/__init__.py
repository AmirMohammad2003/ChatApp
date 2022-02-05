import eventlet
from flask import Flask, redirect, url_for
from flask_cors import CORS
from flask_login import LoginManager
from flask_mail import Mail
from flask_mongoengine import MongoEngine, MongoEngineSessionInterface
from flask_socketio import SocketIO
from flask_wtf import CSRFProtect

from .configs import BaseConfig

eventlet.monkey_patch()

db = MongoEngine()
login_manager = LoginManager()
csrf_protect = CSRFProtect()
mail = Mail()
cors = CORS(supports_credentials=True)


def create_app():
    app = Flask(__name__)
    app.config.from_object(BaseConfig)
    login_manager.init_app(app)
    csrf_protect.init_app(app)
    mail.init_app(app)
    db.init_app(app)
    cors.init_app(
        app, resources={
            r"/(api|auth)/*": {"origins": ["http://127.0.0.1:3000", "http://localhost:3000"]}
        }
    )
    app.session_interface = MongoEngineSessionInterface(db)
    socketio = SocketIO(app, manage_session=False, cookie='_uuid')
    login_manager.login_view = 'auth.login'

    from .models import Message, User

    @login_manager.user_loader
    def load_user(id):
        return User.objects.get(pk=id)

    from .api import api as _api
    from .auth import auth as _auth
    from .views import views as _views

    app.register_blueprint(_auth, url_prefix='/auth')
    app.register_blueprint(_views, url_prefix='/public')
    app.register_blueprint(_api, url_prefix='/api')

    @app.route('/')
    def redi2():
        return redirect(url_for('auth.login'))

    return socketio, app
