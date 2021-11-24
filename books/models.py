from django.contrib.auth.models import AbstractUser
from django.db.models import CASCADE, ForeignKey, Model
from django.db.models.fields import TextField


class User(AbstractUser):
    pass

class Watchlist(Model):
    user = ForeignKey(
        User,
        on_delete=CASCADE
    )
    books = TextField()
