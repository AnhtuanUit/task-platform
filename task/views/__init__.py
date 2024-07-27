# task/views/__init__.py

from .user_views import (
    index,
    login_view,
    logout_view,
    register_view,
    profile_view,
    edit_profile_view,
)
from .board_views import (
    create_board_view,
    board,
    edit_board_view,
    delete_board,
    board_add_member_view,
    board_members_view,
    board_delete_member,
)
from .list_views import board_add_list_view, edit_list_view, delete_list
from .card_views import (
    list_add_card_view,
    card,
    edit_card_title,
    edit_card,
    delete_card,
    create_attachment_file,
    delete_attachment_file,
    serve_file,
    card_members_view,
    card_delete_member,
)
