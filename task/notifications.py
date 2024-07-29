from .models import (
    Notification,
)

from .helpers import model_to_dict_data, json_dumps
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def get_notification_title(type):
    types = {
        "TASK_ASSIGNMENT": "Task assignment",
        "TASK_UPDATED_TITLE": "Task title updated",
        "TASK_UPDATED_DESCRIPTION": "Task description updated",
        "TASK_DONE": "Task done",
        "TASK_CREATED": "Task created",
        "BOARD_UPDATED": "Board title updated",
        "LIST_CREATED": "List created",
        "LIST_UPDATED_TITLE": "List title updated",
    }

    return types[type]


def get_notification_description(type, user):
    types = {
        "TASK_ASSIGNMENT": f"{user} has been assigned to a task.",
        "TASK_UPDATED_TITLE": f"{user} has updated the title of a task.",
        "TASK_UPDATED_DESCRIPTION": f"{user} has updated the description of a task.",
        "TASK_DONE": f"{user} has marked a task as done.",
        "TASK_CREATED": f"{user} has created a new task.",
        "BOARD_UPDATED": f"{user} has updated the board.",
        "LIST_CREATED": f"{user} has created a new list.",
        "LIST_UPDATED_TITLE": f"{user} has updated the title of a list.",
    }

    return types[type]


def send_realtime_data(board_id, action, resource, dict_data):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"realtime_{board_id}",
        {
            "type": f"realtime.message",
            "data": json_dumps(dict_data),
            "action": action,
            "resource": resource,
        },
    )


def send_realtime_data_to_user(user, action, resource, dict_data):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"user_{user.id}",
        {
            "type": f"realtime.message",
            "data": json_dumps(dict_data),
            "action": action,
            "resource": resource,
        },
    )


def send_notifications(type, actor, recipients, description=None):
    title = get_notification_title(type)
    description = description or get_notification_description(type, actor.username)

    for recipient in recipients:
        notification = Notification.objects.create(
            recipient=recipient,
            actor=actor,
            type=type,
            title=title,
            description=description,
        )

        send_realtime_data_to_user(
            recipient,
            "create",
            "notification",
            {"notification": model_to_dict_data(notification)},
        )


def createNotification(actor, type, target_object):
    types = [
        "TASK_ASSIGNMENT",
        "TASK_UPDATED_TITLE",
        "TASK_UPDATED_DESCRIPTION",
        "TASK_DONE",
        "TASK_CREATED",
        "BOARD_UPDATED",
        "LIST_CREATED",
        "LIST_UPDATED_TITLE",
    ]
    # Check if type exist
    if not type in types:
        return None

    # Depending on type detect target_object type
    if type.startswith("TASK_"):
        description = None
        if type == "TASK_ASSIGNMENT":
            description = get_notification_description(
                type, target_object["assignee"].username
            )
            target_object = target_object["card"]

        if type == "TASK_CREATED":
            members = target_object.list.board.members.all()
        else:
            members = target_object.members.all()

        send_notifications(type, actor, members, description)

    elif type.startswith("BOARD_"):
        send_notifications(type, actor, target_object.members.all())

    elif type.startswith("LIST_"):
        send_notifications(type, actor, target_object.board.members.all())
