from datetime import datetime

from flask import request
from flask_login import current_user

from src.models import Message
from src import create_app, db

socketio, app = create_app()

users = {}


@socketio.on('connect')
def save_user_sid(data):
    users[current_user.get_id()] = request.sid


@socketio.on('disconnect')
def delete_user_sid(data):
    del users[current_user.get_id()]


@socketio.on('send')
def receive_client_message(data):
    message = Message(
        content=data['message'],
        from_user=current_user.pk,
        to_user=str(data['to'])
    )
    message.save()
    data['timestamp'] = message.date.strftime("%d %b %Y  %H:%M")
    if str(data['to']) in users:
        data['from'] = {'id': str(current_user.pk),
                        'name': current_user.username}
        socketio.emit(
            'messageReceived',
            data,
            to=users[str(data['to'])]
        )
    socketio.emit(
        'messageSent',
        data,
        to=request.sid
    )


if __name__ == '__main__':
    socketio.run(app)
