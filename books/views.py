from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.forms import Form
from django.forms.fields import CharField
from django.forms.widgets import EmailInput, PasswordInput, TextInput
from django.http import JsonResponse
from django.http.response import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User


# login form to display to the user
class LoginForm(Form):
    username = CharField(max_length=10, label="", 
        widget=TextInput(attrs={"placeholder": "Username"})
    )
    password = CharField(max_length=20, label="", 
        widget=PasswordInput(attrs={"placeholder": "Password"})
    )


# register form to display to the user - inherits fields from LoginForm
class RegisterForm(LoginForm):
    email = CharField(label="", 
        widget=EmailInput(attrs={"placeholder": "Email"})
    )
    confirm_password = CharField(max_length=20, label="", 
        widget=PasswordInput(attrs={"placeholder": "Confirm password"})
    )
    field_order = ["username", "email", "password", "confirm_password"]
    

# display index page
def index(request):
    return render(request, "books/index.html")


# register user and validate their credentials
def register(request):
    if request.method == "GET":
        # render a registration form
        return render(request, "books/index.html", {
            "register": True,
            "register_form": RegisterForm()
        })
    else:
        # retreive and validate registration form
        form = RegisterForm(request.POST)
        if not form.is_valid():
            return HttpResponse("Error in register function() - register form is invalid")
        
        # retreive form fields
        username = form.cleaned_data["username"]
        email = form.cleaned_data["email"]
        password = form.cleaned_data["password"]
        confirm_password = form.cleaned_data["confirm_password"]
        
        # validate and confirm password match
        # if passwords do not match, re-promt user to type in matching passwords
        if (password != confirm_password):
            return render(request, "books/index.html", {
                "register": True,
                "message": "Invalid credentials: passwords do not match",
                "register_form": RegisterForm(initial={
                    "username": username,
                    "email": email
                })
            })
        # try to create a new user
        # IntegrityError is raised if username is already taken
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "books/index.html", {
                "register": True,
                "message": "Invalid credentials: username is already taken",
                "register_form": RegisterForm(initial={
                    "email": email
                })
            })
        # log user in and redirect to index
        login(request, user)
        return HttpResponseRedirect(reverse("index"))


# allow user to login
def login_view(request):
    if request.method == "GET":
        # render a login form
        return render(request, "books/index.html", {
            "login": True,
            "login_form": LoginForm()
        })
    else:
        # get user's credentials and authenticate them
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username = username, password = password)

        # if user is not registered
        if not user:
            return render(request, "books/index.html", {
                "login": True,
                "message": "Invalid credentials: username and/or password are incorrect",
                "login_form": LoginForm(initial={
                    "username": username
                })
            })
        # log user in and redirect to index
        login(request, user)
        return HttpResponseRedirect(reverse("index"))


# log user out 
# (btw, on google, saw something like configuring LOGIN_REDIRECT_URL and LOGOUT_REDIRECT_URL in settings.py)
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

# testing fetch() from script.js
def action(request):
    json = {
        "message": "It worked!!",
    }
    return JsonResponse(json)
