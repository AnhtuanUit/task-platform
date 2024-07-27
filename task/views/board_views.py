from django.urls import reverse
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Prefetch

from ..helpers import (
    apology,
    model_to_dict_data,
)
from ..notifications import (
    send_realtime_data,
    createNotification,
)

from ..models import Board, User, Card

from ..forms import (
    EditBoardForm,
)


# Create board view
@login_required
def create_board_view(request):
    return render(request, "task/new_board.html", {"boards": request.user.boards.all()})


# API get board by id
@login_required
def board(request, board_id):

    # Check if board exist
    board = (
        request.user.boards.filter(id=board_id)
        .prefetch_related("members", "lists__cards", "lists")
        .first()
    )

    if board is None:
        return apology(request, "Board does not exist!", 400)

    # Get task lists of the board
    lists = (
        board.lists.all()
        .order_by("position")
        .prefetch_related(
            Prefetch(
                "cards",
                queryset=Card.objects.order_by("position"),
                to_attr="ordered_cards",
            )
        )
    )
    members = board.members.all()
    total_member = members.count()
    for index, member in enumerate(members):
        member.index = total_member - index

    return render(
        request,
        "task/board.html",
        {
            "board": board,
            "lists": lists,
            "boards": request.user.boards.all(),
            "members": members,
        },
    )


# Edit board view
@login_required
def edit_board_view(request, board_id):

    # Check if board exist
    board = request.user.boards.filter(id=board_id).first()
    if board is None:
        return apology(request, "Board does not exist", 400)

    # Check if post method
    if request.method == "POST":

        form = EditBoardForm(request.POST)
        # Validate form data
        if form.is_valid():

            # Get clean data
            name = form.cleaned_data.get("name")
            description = form.cleaned_data.get("description")

            # Update board to DB
            board.name = name
            board.description = description
            board.save()

            # Realtime update FE
            send_realtime_data(
                board.id,
                "edit",
                "board",
                {
                    "board": model_to_dict_data(board),
                    "browser_id": request.headers.get("Browser-ID"),
                },
            )

            # Create notificaiton and send realtime
            createNotification(request.user, "BOARD_UPDATED", board)

            return redirect(reverse("board", args=[board_id]))

        # If not valid form data
        else:
            return render(
                request,
                "task/edit_board.html",
                {"boards": request.user.boards.all(), "board": board, "form": form},
            )

    else:
        return render(
            request,
            "task/edit_board.html",
            {
                "boards": request.user.boards.all(),
                "board": board,
                "form": EditBoardForm(
                    initial={"name": board.name, "description": board.description}
                ),
            },
        )


# Delete board
@login_required
def delete_board(request, board_id):

    # Check if board exists
    board = request.user.boards.filter(id=board_id).first()
    if board is None:
        return apology(request, "Board does not exist!", 400)

    # Delete on method POST
    if request.method == "POST":

        # Delete board
        board.delete()

        # Realtime update FE
        send_realtime_data(
            board.id,
            "delete",
            "board",
            {"id": board.id, "browser_id": request.headers.get("Browser-ID")},
        )

        # Rediect to home page if delete success
        return redirect("index")

    return apology(request, "Delete not allowed via GET", 400)


# Create board member
@login_required
def board_add_member_view(request, board_id):

    # Chek if board exist
    board = Board.objects.filter(id=board_id).first()
    if board is None:
        return HttpResponse("Board does not exist!")

    # Render board add memeber page
    return render(
        request,
        "task/board_add_member.html",
        {"board": board, "boards": request.user.boards.all()},
    )


# Board members view
@login_required
def board_members_view(request, board_id):

    # Chek if board exist
    board = Board.objects.filter(id=board_id).first()
    if board is None:
        return apology(request, "Board does not exist!", 400)

    # Check if user is board member
    if not request.user in board.members.all():
        return apology(request, "Forbidden.", 403)

    members = board.members.all()
    for index, member in enumerate(members, start=1):
        member.index = index

    return render(
        request,
        "task/board_members.html",
        {
            "board": board,
            "boards": request.user.boards.all(),
            "members": members,
        },
    )


# Delete board member
@login_required
def board_delete_member(request, board_id):

    # Chek if board exist
    board = Board.objects.filter(id=board_id).first()
    if board is None:
        return apology(request, "Board does not exist!", 400)

    # Check if user is board member
    if not request.user in board.members.all():
        return apology(request, "Forbidden.", 403)

    if request.method == "POST":

        # Get delete data
        member_id = request.POST["memberId"]

        # Get member
        member = User.objects.filter(id=member_id).first()
        board.members.remove(member)

        # Model to dict
        members_dict = [
            {"id": member.id, "username": member.username}
            for member in board.members.all()
        ]

        # Realtime update FE
        send_realtime_data(
            board.id,
            "delete",
            "board_member",
            {
                "members": members_dict,
                "browser_id": request.headers.get("Browser-ID"),
            },
        )

        return redirect(reverse("board_members", args=[board_id]))
