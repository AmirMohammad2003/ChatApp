from uuid import uuid4

from flask import (Blueprint, flash, redirect, render_template, request,
                   session, url_for, jsonify)
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash

from . import db
from .forms import LoginForm, ChooseUsernameForm
from .models import User

auth = Blueprint('auth', __name__)


@auth.route('/login/', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return jsonify({"success": True, "message": "You are already logged in"})
    print(request.form)
    form = LoginForm(request.form)
    if form.validate():
        email = form.email.data
        if (user := User.objects(email=form.email.data).first()) is not None:
            if (user.username is not None):
                login_user(user)
                session['_uuid'] = user.get_uuid()
                return jsonify({
                    "success": True,
                    "status": "logged-in",
                    "message": "Login successful"
                })

            else:
                email = user.email

        session['_email'] = email
        return jsonify({
            "success": True,
            "status": "signed-up",
            "message": "signed-up successful"
        })

    return jsonify({
        "success": False,
        "errors": form.errors
    })


@auth.route('/login/choose-username/', methods=['POST'])
def choose_username():
    if current_user.is_authenticated:
        return jsonify({"success": True, "message": "You are already logged in"})

    form = ChooseUsernameForm(request.form)
    if form.validate():
        if (User.objects(email=form.username.data).first()) is None:
            user = User.objects(email=session['_email']).first()
            if (user is not None):
                user.username = form.username.data
                login(user)
                session['_uuid'] = user.get_uuid()
                return jsonify({
                    "success": True,
                    "status": "logged-in",
                    "message": "Login successful"
                })

            return jsonify({
                "success": False,
                "message": "User not found"
            })

        return jsonify({
            "success": False,
            "errors": "Username already exists"
        })

    return jsonify({
        "success": False,
        "errors": form.errors
    })


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))


# @auth.route('/sign-up', methods=['GET', 'POST'])
# def sign_up():
#     if current_user.is_authenticated:
#         return redirect(url_for('views.chat_room'))

#     if request.method == 'POST':
#         form = RegisterForm(request.form)
#         if form.validate():
#             if form.password.data == form.password2.data:
#                 if User.objects(username=form.username.data).first() is None:
#                     user = User(
#                         username=form.username.data,
#                         hashed_password=generate_password_hash(
#                             form.password.data, method="pbkdf2:sha256:260000"
#                         ),
#                         uuid=uuid4().hex
#                     )
#                     user.save()
#                     login_user(user)
#                     session['_uuid'] = user.uuid
#                     return redirect(url_for('views.chat_room'))

#                 else:
#                     flash('username is already taken', category='error')
#             else:
#                 flash('passwords should match', category='error')
#         else:
#             flash('form validation failed', category='error')

#     return render_template('signup.html')
