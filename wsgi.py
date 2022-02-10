from flask import request
from flask_login import current_user

from src import create_app
from src.models import Message

socketio, app = create_app()

users = {}  # gonna change this to be stored in the database.


@socketio.on('connect')
def save_user_sid():
    users[current_user.get_id()] = request.sid


@socketio.on('disconnect')
def delete_user_sid():
    del users[current_user.get_id()]


@socketio.on('send')
def receive_client_message(data):
    if not current_user.is_authenticated:
        return

    is_friend = False
    for friend in current_user.friends:
        if str(data['to']) == str(friend.pk):
            is_friend = True
            break

    if not is_friend:
        return

    message = Message(
        content=data['message'],
        from_user=current_user.pk,
        to_user=str(data['to'])
    )
    message.save()

    data['timestamp'] = message.date.strftime("%d %b %Y  %H:%M")
    if str(data['to']) in users:
        data['from'] = str(current_user.pk)
        data['sender'] = False
        socketio.emit(
            'messageReceived',
            data,
            to=users[str(data['to'])]
        )

    data['sender'] = True
    socketio.emit(
        'messageSent',
        data,
        to=request.sid
    )


if __name__ == '__main__':
    socketio.run(app)
