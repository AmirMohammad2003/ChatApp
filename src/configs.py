from dotenv import dotenv_values


class BaseConfig(object):
    TESTING = False
    DEBUG = True
    SECRET_KEY = dotenv_values(".env")['SECRET_KEY']
    WTF_CSRF_SECRET_KEY = dotenv_values(".env")['WTF_CSRF_SECRET_KEY']
    MONGODB_DB = dotenv_values(".env")['DB_NAME']
    MONGODB_HOST = dotenv_values(".env")['DB_HOST']
    MONGODB_PORT = int(dotenv_values(".env")['DB_PORT'])
    MONGODB_USERNAME = dotenv_values(".env")['DB_USER']
    MONGODB_PASSWORD = dotenv_values(".env")['DB_PASS']
