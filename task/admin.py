from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Board, List, Attachment, Card, Assignment, Notification

# Register your models here.


# Custom UserAdmin
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + ((None, {"fields": ("bio",)}),)


# Board Admin
class BoardAdmin(admin.ModelAdmin):
    list_display = ("name", "description", "created_at")
    search_fields = ("name", "description")
    list_filter = ("created_at",)
    filter_horizontal = ("members",)


# List Admin
class ListAdmin(admin.ModelAdmin):
    list_display = ("name", "board", "position", "created_at")
    search_fields = ("name", "board__name")
    list_filter = ("board",)


# Attachment Admin
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ("title", "card", "uploaded_at")
    search_fields = ("title", "card__title")
    list_filter = ("card",)


# Card Admin
class CardAdmin(admin.ModelAdmin):
    list_display = ("title", "description", "due_date", "position", "created_at")
    search_fields = ("title", "description", "list__name")
    list_filter = ("due_date", "list")
    filter_horizontal = ("members",)


# Assignment Admin
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("assignee", "card", "created_at")
    search_fields = ("assignee__username", "card__title")
    list_filter = ("assignee", "card")


# Notification Admin
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "recipient",
        "actor",
        "type",
        "card",
        "board",
        "list",
        "title",
        "is_read",
        "created_at",
    )
    search_fields = ("recipient__username", "actor__username", "title", "description")
    list_filter = ("type", "is_read", "created_at")


# Register models with their admin classes
admin.site.register(User, CustomUserAdmin)
admin.site.register(Board, BoardAdmin)
admin.site.register(List, ListAdmin)
admin.site.register(Attachment, AttachmentAdmin)
admin.site.register(Card, CardAdmin)
admin.site.register(Assignment, AssignmentAdmin)
admin.site.register(Notification, NotificationAdmin)
