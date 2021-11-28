from django.urls import path

from . import views

app_name = "books"
urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("books/add", views.add, name="add"),
    path("books/<str:book_id>/<str:list_name>", views.remove, name="remove"),
    path("books/<str:book_id>/<str:old_list>/<str:new_list>", views.update, name="update"),
    path("profile/books", views.profile, name="profile"),
    path("books/mybooks", views.get_all_books, name="mybooks")
]