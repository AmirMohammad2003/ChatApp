from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField, PasswordField
from wtforms.validators import DataRequired, EqualTo, Length


class LoginForm(FlaskForm):
    username = StringField(validators=[Length(min=1, max=60), DataRequired()])
    password = PasswordField(
        validators=[Length(min=1, max=60), DataRequired()])
    submit = SubmitField()


class RegisterForm(FlaskForm):
    username = StringField(validators=[Length(min=1, max=60), DataRequired()])
    password = PasswordField(
        validators=[Length(min=1, max=60), DataRequired()]
    )
    password2 = PasswordField(validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField()
