from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    # Authenticate
    path("login", views.login_view, name="login"),
    path("register", views.register_view, name="register"),
    path("logout", views.logout_view, name="logout"),
    # User
    path("profile", views.profile_view, name="profile"),
    # Create, get board view
    path("create_board", views.create_board_view, name="create_board"),
    path("boards/<int:board_id>", views.board, name="board"),
    # Create list view
    path(
        "boards/<int:board_id>/add_list",
        views.board_add_list_view,
        name="board_add_list_view",
    ),
    # Create card view
    path(
        "lists/<int:list_id>/add_card",
        views.list_add_card_view,
        name="list_add_card_view",
    ),
    # Create member(board) view
    path(
        "boards/<int:board_id>/add_member",
        views.board_add_member_view,
        name="board_add_member",
    ),
    # APIs
    # - API create new board
    # - API Show boards, lists, cards
    path("boards", views.boards, name="boards"),
    # - API LIST - board add list
    path("boards/<int:board_id>/lists", views.add_list, name="board_add_list"),
    path("lists/<int:list_id>/move", views.move_list, name="move_list"),
    # - API CARD - list add card
    path("lists/<int:list_id>/cards", views.add_card, name="card"),
    path("cards/<int:card_id>", views.card, name="card"),
    path("cards/<int:card_id>/move", views.move_card, name="move_card"),
    # - API MEMBER - board add member
    path("boards/<int:board_id>/members", views.board_member, name="board_member"),
]
