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
    board_view,
    edit_board_view,
    delete_board,
    create_board_member_view,
    board_members_view,
    delete_board_member,
)
from .list_views import create_list_view, edit_list_view, delete_list
from .card_views import (
    create_card_view,
    card_view,
    edit_card_title_view,
    edit_card_view,
    delete_card,
    create_attachment_file_view,
    delete_attachment_file,
    serve_file,
    card_members_view,
    delete_card_member,
)
