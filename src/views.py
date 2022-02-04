from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user

views = Blueprint('views', __name__)

@views.route('/chat-room')
@login_required
def chat_room():
    return render_template('chat-room.html', user=current_user)

@views.route('/')
def redi():
    return redirect(url_for('auth.login'))
