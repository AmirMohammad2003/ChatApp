from flask_wtf import FlaskForm
from wtforms import SubmitField, EmailField, StringField
from wtforms.validators import DataRequired, Email


class LoginForm(FlaskForm):
    # username = StringField('Username', validators=[DataRequired()])
    email = EmailField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField()
