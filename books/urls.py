from django.urls import path

from . import views

app_name = "books"
urlpatterns = [
    path("", views.index, name="index"),
    path("books", views.books, name="books"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("books/action", views.action, name="action"),
    path("profile/books", views.profile, name="profile"),
    path("books/mybooks", views.get_all_books, name="mybooks")
]