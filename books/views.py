import json
from ast import literal_eval

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.forms import Form
from django.forms.fields import CharField
from django.forms.widgets import EmailInput, PasswordInput, TextInput
from django.http import JsonResponse
from django.http.response import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import ReadingList, User


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
        return HttpResponseRedirect(reverse("books:index"))


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
        return HttpResponseRedirect(reverse("books:index"))


# log user out 
# (btw, on google, saw something like configuring LOGIN_REDIRECT_URL and LOGOUT_REDIRECT_URL in settings.py)
@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("books:index"))


# add the book to the user's reading list of choice
@csrf_exempt
def add(request):
    # request method can only be post for this route
    if request.method != "POST":
        return HttpResponse("Error - this route can only be accessed via a POST request")
    
    # user must be logged in to add a book to their reading list
    if not request.user.is_authenticated:
        return JsonResponse({"UserNotLoggedIn": True})
    
    # retrieve POST data
    data: dict = json.loads(request.body)
    book_id = data["bookId"]
    list_name = data["listName"]

    # if user doesn't have any items in their list, a new ReadingList object is created, else get the users existing list
    users_list = ReadingList.objects.get_or_create(user = request.user)[0]

    # get the current list of books in the user's list, and add the new book
    # converting to a set to prevent duplicate book_ids
    book_list: set = set(literal_eval(getattr(users_list, list_name)))
    book_list.add(book_id)
    book_list = f"{list(book_list)}"

    # update model field
    setattr(users_list, list_name, book_list)
    users_list.save(update_fields = [list_name])
    return JsonResponse({f"Books in user {request.user.username}'s {list_name} list": book_list})


# remove a book from a chosen list
def remove(request, book_id, list_name):
    pass


# remove a book from old list, and add it to the new list
def update(request, book_id, old_list, new_list):
    pass


# display user's profile & book list
@login_required
def profile(request):
    return render (request, "books/profile.html")


# return in JSON format all of the books in the user's list 
# empty values are returned if user is not logged in (TypeError), or if user has not added anything to their reading list yet (DoesNotExist)
def get_all_books(request):
    fields = ["read", "unread", "purchased", "dropped"]
    books = {}
    try:
        users_list = ReadingList.objects.get(user = request.user)
    except (ReadingList.DoesNotExist, TypeError):
        books = {field: [] for field in fields}
    else:
        for field in fields:
            books[field] = literal_eval(getattr(users_list, field))
    return JsonResponse({"books": books})
