from django.urls import path

from . import views

app_name = "books"
urlpatterns = [
    path("", views.index, name="index"),
    path("action", views.action, name="action"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]