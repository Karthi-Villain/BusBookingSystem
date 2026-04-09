import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-bus-key'
    
    # ---------------------------------------------------------
    # MySQL DATABASE CONFIGURATION
    # ---------------------------------------------------------
    # FORMAT: mysql+mysqlconnector://<username>:<password>@<server>/<database>
    
    # Replace 'root', 'your_password', 'localhost', and 'bus_db' with your actual MySQL details
    default_db = 'mysql+mysqlconnector://root:admin@localhost/bus_db'
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or default_db
    SQLALCHEMY_TRACK_MODIFICATIONS = False