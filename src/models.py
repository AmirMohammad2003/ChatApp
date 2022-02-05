from datetime import datetime

from flask_login import UserMixin

from . import db


class User(db.Document, UserMixin):
    username = db.StringField(max_length=50, null=True)
    email = db.EmailField(required=True, unique=True)
    uuid = db.UUIDField(binary=True, required=True, unique=True)
    date_joined = db.DateTimeField(required=True, default=datetime.utcnow)
    last_seen = db.DateTimeField(required=True, default=datetime.utcnow)
    messages = db.ListField(
        db.ReferenceField(
            'Message',
            reverse_delete_rule=db.DO_NOTHING
        )
    )
    friends = db.ListField(db.ReferenceField(
        'User', reverse_delete_rule=db.PULL
    ))

    def get_uuid(self):
        return self.uuid


class Message(db.Document):
    content = db.StringField(nullable=False)
    date = db.DateTimeField(required=True, default=datetime.utcnow)
    from_user = db.ReferenceField(
        'User', nullable=False, required=True, reverse_delete_rule=db.CASCADE
    )
    to_user = db.ReferenceField(
        'User', nullable=False, required=True, reverse_delete_rule=db.CASCADE
    )
