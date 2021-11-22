from django.contrib.auth.models import AbstractUser
from django.db.models import Model, ForeignKey, CASCADE
from django.db.models.fields import TextField

class User(AbstractUser):
    pass

class Watchlist(Model):
    user = ForeignKey(
        User,
        on_delete=CASCADE
    )
    books = TextField()