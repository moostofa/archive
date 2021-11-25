from django.contrib.auth.models import AbstractUser
from django.db.models import CASCADE, ForeignKey, Model
from django.db.models.fields import TextField


class User(AbstractUser):
    pass

class ReadingList(Model):
    user = ForeignKey(
        User,
        on_delete=CASCADE
    )
    read = TextField(default="[]")
    unread = TextField(default="[]")
    purchased = TextField(default="[]")
    dropped = TextField(default="[]")
