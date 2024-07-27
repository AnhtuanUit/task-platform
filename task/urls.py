from django.urls import path

from . import views
from . import api

urlpatterns = [
    # Home page
    path("", views.index, name="index"),
    # Authenticate
    path("login", views.login_view, name="login"),
    path("register", views.register_view, name="register"),
    path("logout", views.logout_view, name="logout"),
    # Profile
    path("profile/<int:profile_id>", views.profile_view, name="profile"),
    path("profile/<int:profile_id>/edit", views.edit_profile_view, name="edit_profile"),
    # Board
    path("create_board", views.create_board_view, name="create_board"),
    path("boards/<int:board_id>", views.board, name="board"),
    path("edit_board/<int:board_id>", views.edit_board_view, name="edit_board"),
    path("delete_board/<int:board_id>", views.delete_board, name="delete_board"),
    # Board members
    path(
        "boards/<int:board_id>/add_member",
        views.board_add_member_view,
        name="board_add_member",
    ),
    path(
        "boards/<int:board_id>/get_members",
        views.board_members_view,
        name="board_members",
    ),
    path(
        "boards/<int:board_id>/delete_member",
        views.board_delete_member,
        name="board_delete_member",
    ),
    path("media/<path:file_path>/", views.serve_file, name="media"),
    # Task list
    path(
        "boards/<int:board_id>/add_list",
        views.board_add_list_view,
        name="board_add_list_view",
    ),
    path("edit_list/<int:list_id>", views.edit_list_view, name="edit_list"),
    path("delete_list/<int:list_id>", views.delete_list, name="delete_list"),
    # Card
    path(
        "lists/<int:list_id>/add_card",
        views.list_add_card_view,
        name="list_add_card_view",
    ),
    path("cards/<int:card_id>", views.card, name="card"),
    path(
        "edit_card_title/<int:card_id>",
        views.edit_card_title,
        name="edit_card_title",
    ),
    path(
        "edit_card/<int:card_id>",
        views.edit_card,
        name="edit_card",
    ),
    path(
        "delete_card/<int:card_id>",
        views.delete_card,
        name="delete_card",
    ),
    # Card members
    path("cards/<int:card_id>/members", views.card_members_view, name="card_members"),
    path(
        "cards/<int:card_id>/delete_member",
        views.card_delete_member,
        name="card_delete_member",
    ),
    # Card attachments
    path(
        "cards/<int:card_id>/create_attachment_file",
        views.create_attachment_file,
        name="create_attachment_file",
    ),
    path(
        "delete_attachment_file/<int:attachment_id>",
        views.delete_attachment_file,
        name="delete_attachment_file",
    ),
    # APIs
    # Board
    path("boards", api.boards, name="boards"),
    # List
    path("boards/<int:board_id>/lists", api.add_list, name="board_add_list"),
    path("lists/<int:list_id>/move", api.move_list, name="move_list"),
    # Card
    path("lists/<int:list_id>/cards", api.add_card, name="add_card"),
    path("cards/<int:card_id>/move", api.move_card, name="move_card"),
    # Board members
    path("boards/<int:board_id>/members", api.board_member, name="board_member"),
    # Notification
    path("notifications", api.get_notifications, name="notifications"),
    path(
        "notifications/<int:notification_id>/read",
        api.read_notification,
        name="read_notification",
    ),
]
