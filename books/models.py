from ast import literal_eval

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

    def __str__(self) -> str:
        return f"""
        User: {self.user.username},
        Books read: {len(literal_eval(self.read))},
        Books to-read: {len(literal_eval(self.unread))},
        Books purchased: {len(literal_eval(self.purchased))},
        Books dropped: {len(literal_eval(self.dropped))}
        """
