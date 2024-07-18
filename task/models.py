import os
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.contrib.auth.models import Group, Permission
from django.utils.translation import gettext_lazy as _

hex_color_validator = RegexValidator(
    regex=r"^#(?:[0-9a-fA-F]{3}){1,2}$",
    message="Enter a valid hex color code, e.g. #FFFFFF or #FFF.",
)


# Create your models here.


# 1. User: default Django, username, email, password, firstName, last_name, bio, avatar, created_at, updated_at
class User(AbstractUser):
    # Add custom fields
    # Add your custom fields here
    bio = models.CharField(max_length=256)


# 1.2 Project    * name, description, created_by, created_at, updated_at


class Project(models.Model):
    name = models.CharField(max_length=256)
    description = models.CharField(max_length=256)
    created_by = models.ManyToManyField(User, related_name="projects")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# 2. Board: name, description, created_at
#  3. BoardMembership: board_id, member_id, created_at


class Board(models.Model):
    name = models.CharField(max_length=256)
    description = models.CharField(max_length=256)
    members = models.ManyToManyField(User, related_name="boards")
    created_at = models.DateTimeField(auto_now_add=True)


#  4. List: board_id, name, created_at
class List(models.Model):
    board = models.ForeignKey("Board", on_delete=models.CASCADE, related_name="lists")
    name = models.CharField(max_length=256)
    position = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)


#  4.1 Lable: name, color
class Label(models.Model):
    name = models.CharField(max_length=64)
    color = models.CharField(
        max_length=7,
        validators=[hex_color_validator],
        help_text="Enter a valid hex color code, e.g. #FFFFFF or #FFF.",
    )


#  4.2 Attachment:
class Attachment(models.Model):
    title = models.CharField(max_length=256, blank=True)
    card = models.ForeignKey(
        "Card", on_delete=models.CASCADE, related_name="attachments"
    )
    file = models.FileField(upload_to="uploads/")
    uploaded_at = models.DateTimeField(auto_now_add=True)


#  5. Card: list_id, descriptions, due_date, labels, and attachments, created_at
class Card(models.Model):
    list = models.ForeignKey("List", on_delete=models.CASCADE, related_name="cards")
    title = models.CharField(max_length=256)
    description = models.CharField(max_length=256)
    due_date = models.DateTimeField(null=True, blank=True)
    position = models.DecimalField(max_digits=10, decimal_places=2)
    members = models.ManyToManyField(User, related_name="cards")
    created_at = models.DateTimeField(auto_now_add=True)


#  6. Assignment: card_id, assignee_id, created_at
class Assignment(models.Model):
    card = models.ForeignKey(
        "Card", on_delete=models.CASCADE, related_name="assignments"
    )
    assignee = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


#  7. Notification: user_id, type(card_created, card_asssigned,. ..), card_id, board_id, description, created_at, id_read.
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=20)
    card = models.ForeignKey(
        "Card", on_delete=models.CASCADE, related_name="notifications"
    )
    board = models.ForeignKey(
        "Board", on_delete=models.CASCADE, related_name="notificaitons"
    )
    list = models.ForeignKey(
        "List", on_delete=models.CASCADE, related_name="notificaitons"
    )
    description = models.CharField(max_length=256)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
