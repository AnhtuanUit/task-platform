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


# 1. User
class User(AbstractUser):
    # Add custom fields
    # Add your custom fields here
    bio = models.CharField(max_length=256)


# 2. Board
class Board(models.Model):
    name = models.CharField(max_length=256)
    description = models.CharField(max_length=256)
    members = models.ManyToManyField(User, related_name="boards")
    created_at = models.DateTimeField(auto_now_add=True)


# 3. List
class List(models.Model):
    board = models.ForeignKey("Board", on_delete=models.CASCADE, related_name="lists")
    name = models.CharField(max_length=256)
    position = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)


# 4 Attachment:
class Attachment(models.Model):
    title = models.CharField(max_length=256, blank=True)
    card = models.ForeignKey(
        "Card", on_delete=models.CASCADE, related_name="attachments"
    )
    file = models.FileField(upload_to="uploads/")
    uploaded_at = models.DateTimeField(auto_now_add=True)


# 5. Card
class Card(models.Model):
    list = models.ForeignKey("List", on_delete=models.CASCADE, related_name="cards")
    title = models.CharField(max_length=256)
    description = models.CharField(max_length=256)
    due_date = models.DateTimeField(null=True, blank=True)
    position = models.DecimalField(max_digits=10, decimal_places=2)
    members = models.ManyToManyField(User, related_name="cards")
    created_at = models.DateTimeField(auto_now_add=True)


# 6. Assignment
class Assignment(models.Model):
    card = models.ForeignKey(
        "Card", on_delete=models.CASCADE, related_name="assignments"
    )
    assignee = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


# 7. Notification
class Notification(models.Model):
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    actor = models.ForeignKey(
        User,
        related_name="notifications_created",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    type = models.CharField(max_length=20)
    card = models.ForeignKey(
        "Card", on_delete=models.CASCADE, related_name="notifications", null=True
    )
    board = models.ForeignKey(
        "Board", on_delete=models.CASCADE, related_name="notificaitons", null=True
    )
    list = models.ForeignKey(
        "List", on_delete=models.CASCADE, related_name="notificaitons", null=True
    )
    title = models.CharField(max_length=256, null=True)
    description = models.CharField(max_length=256)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
