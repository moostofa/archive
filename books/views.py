from django.forms.fields import CharField
from django.forms.widgets import EmailInput, PasswordInput, TextInput
from django.http.response import HttpResponse
from django.shortcuts import render
from django.http import JsonResponse
from django.forms import Form

# login form for user to fill in
class LoginForm(Form):
    username = CharField(max_length=10, label="", 
        widget=TextInput(attrs={"placeholder": "Username"})
    )
    email = CharField(label="", 
        widget=EmailInput(attrs={"placeholder": "Email"})
    )
    password = CharField(max_length=20, label="", 
        widget=PasswordInput(attrs={"placeholder": "Password"})
    )


# display index page
def index(request):
    return render(request, "books/index.html")


# allow user to login
def login_view(request):
    if request.method == "GET":
        return render(request, "books/index.html", {
            "login": True,
            "login_form": LoginForm()
        })
    else:
        return HttpResponse("TODO: Login user")


# log user out 
# (btw, on google, saw something like configuring LOGIN_REDIRECT_URL and LOGOUT_REDIRECT_URL in settings.py)
def logout_view(request):
    pass


# register user and validate credentials
def register(request):
    pass

# testing fetch() from script.js
def action(request):
    json = {
        "message": "It worked!!",
    }
    return JsonResponse(json)