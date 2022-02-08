from uuid import uuid4

from flask import Blueprint, jsonify, request, session
from flask_login import current_user, login_required, login_user, logout_user

from .forms import ChooseUsernameForm, LoginForm
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
        print(email)
        (user := User.objects(email=email).first())
        print(user)
        if user is not None:
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

        else:
            User(email=email, uuid=uuid4().hex).save()

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


@auth.route('/choose-username/', methods=['POST'])
def choose_username():
    if current_user.is_authenticated:
        return jsonify({"success": True, "message": "You are already logged in"})
    print(session['_email'])
    form = ChooseUsernameForm(request.form)
    if form.validate():
        if (User.objects(email=form.username.data).first()) is None:
            user = User.objects(email=session['_email']).first()
            if (user is not None):
                user.username = form.username.data
                user.save()
                login_user(user)
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
    return jsonify({"success": True, "message": "Logged out successfully"})
