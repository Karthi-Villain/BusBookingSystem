from flask import Flask
from flask_cors import CORS
from app.models import db
from app.routes import api
from app.config import Config  # Import your config class
import os

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Load configuration from Config class
    app.config.from_object(Config)

    db.init_app(app)
    app.register_blueprint(api)

    return app