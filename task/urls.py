from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    # Authenticate
    path("login", views.login_view, name="login"),
    path("register", views.register_view, name="register"),
    path("logout", views.logout_view, name="logout"),
    # Profile
    path("profile/<int:profile_id>", views.profile_view, name="profile"),
    path("profile/<int:profile_id>/edit", views.edit_profile_view, name="edit_profile"),
    # Create, get board view
    path("create_board", views.create_board_view, name="create_board"),
    path("boards/<int:board_id>", views.board, name="board"),
    path("edit_board/<int:board_id>", views.edit_board_view, name="edit_board"),
    path("delete_board/<int:board_id>", views.delete_board, name="delete_board"),
    # Create list view
    path(
        "boards/<int:board_id>/add_list",
        views.board_add_list_view,
        name="board_add_list_view",
    ),
    path("edit_list/<int:list_id>", views.edit_list_view, name="edit_list"),
    path("delete_list/<int:list_id>", views.delete_list, name="delete_list"),
    # Create card view
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
    # Create attachment file
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
    # Create member(board) view
    path(
        "boards/<int:board_id>/add_member",
        views.board_add_member_view,
        name="board_add_member",
    ),
    # Server media file
    path("media/<path:file_path>/", views.serve_file, name="media"),
    # APIs
    # - API create new board
    # - API Show boards, lists, cards
    path("boards", views.boards, name="boards"),
    # - API LIST - board add list
    path("boards/<int:board_id>/lists", views.add_list, name="board_add_list"),
    path("lists/<int:list_id>/move", views.move_list, name="move_list"),
    # - API CARD - list add card
    path("lists/<int:list_id>/cards", views.add_card, name="add_card"),
    path("cards/<int:card_id>/move", views.move_card, name="move_card"),
    # - API MEMBER - board add member
    path("boards/<int:board_id>/members", views.board_member, name="board_member"),
    # - API Member - card add member
    path("cards/<int:card_id>/members", views.card_member, name="card_member"),
]
