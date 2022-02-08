from flask import Blueprint, jsonify
from flask_login import current_user, login_required
from mongoengine.queryset.visitor import Q
from flask_wtf.csrf import generate_csrf

from . import db
from .models import Message, User

api = Blueprint('api', __name__)


def userrow2dict(r):
    return {'id': str(r.pk), 'name': r.username}


def clean_messages(messages):
    msgs = []
    msg = {}
    for message in messages:
        msg['id'] = str(message.id)
        msg['timestamp'] = message.date.strftime("%d %b %Y  %H:%M")
        msg['content'] = message.content
        if message.from_user == current_user.pk:
            msg['sender'] = True

        else:
            msg['sender'] = False

        msgs.append(msg.copy())
    return msgs


@api.route('/csrf/', methods=['GET'])
def get_csrf_token():
    return jsonify({'csrf_token': generate_csrf()})


@api.route('/search/<string:query>/', methods=['GET'])
@login_required
def search(query):
    users = User.objects(Q(username__icontains=query.strip()) &
                         Q(id__nin=[current_user.pk]))

    return jsonify(list(map(userrow2dict, users))) if len(users) > 0 else jsonify({})


@api.route('/add-friend/<int:id>')
@login_required
def add_friend(id):
    if (user := User.objects(pk=id).first()) is not None:
        if current_user.friends(pk__exact=id).first() is not None:
            return jsonify({"success": True, "friend": userrow2dict(user)})

        current_user.update_one(push__author=user)
        return jsonify({"success": True, "friend": userrow2dict(user)})

    return jsonify({"success": False})

# @api.route('/load-friend/<int:id>')
# def load_friend(id):
#     row2dict = lambda r: {c.name: str(getattr(r, c.name)) for c in r.__table__.columns if c.name in ('id', 'name')}

#     if (user := User.query.filter_by(id=id).first()) is not None:
#         if Friends.query.filter_by(user_id=current_user.id, friend_id=id).first() is not None:
#             friend = User.query.filter_by(id=id).first()
#             f = userrow2dict(friend)
#             return jsonify({"success": True, "friend": f})

#     return jsonify({"success": False})


@api.route('/load-friends/')
@login_required
def load_friends():
    if (friends := current_user.friends) is not None:
        friends_list = []
        for friend in friends:
            friends_list.append(userrow2dict(friend))

        return jsonify({"success": True, "friends": friends_list})

    return jsonify({"success": False})


@api.route('/load-messages/<int:_id>')
@login_required
def load_messages(_id):
    if _id == current_user.pk:
        return jsonify({"success": False})

    if (user := User.objects(id=_id).first()) is not None:
        if current_user.friends(pk__exact=id).first() is not None:
            messages = Message.objects(
                (Q(from_id__exact=current_user.pk) & Q(to_id__exact=_id)) |
                (Q(from_id__exact=_id) & Q(to_id__exact=current_user.pk))
            ).order_by(["date"])
            return jsonify({"success": True, "messages": clean_messages(messages)})
            # return jsonify({"success": True, "friend": f})

    return jsonify({"success": False})
