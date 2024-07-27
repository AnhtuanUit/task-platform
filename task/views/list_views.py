from django.urls import reverse
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from ..helpers import (
    apology,
    model_to_dict_data,
)
from ..notifications import (
    send_realtime_data,
    createNotification,
)

from ..models import (
    Board,
    List,
)

from ..forms import (
    EditListForm,
)


# Create task list view
@login_required
def create_list_view(request, board_id):

    # Check if board exist
    board = Board.objects.filter(id=board_id).first()
    if board is None:
        return HttpResponse("Board not found!")

    return render(
        request,
        "task/create_list.html",
        {"board": board, "boards": request.user.boards.all()},
    )


# Edit task list view
@login_required
def edit_list_view(request, list_id):

    # Get list by list_id
    list = List.objects.filter(id=list_id).first()
    if list is None:
        return apology(request, "List does not exist!", 400)

    # Check if the user is member of the board associated with this list
    if request.user not in list.board.members.all():
        return apology(request, "Board does not exist!", 400)

    if request.method == "POST":

        # Parse post data
        form = EditListForm(request.POST)

        # Valid form
        if form.is_valid():

            name = form.cleaned_data["name"]

            # Update list
            list.name = name
            list.save()

            # Create notificaiton and send realtime
            createNotification(request.user, "LIST_UPDATED_TITLE", list)

            # Realtime update FE
            send_realtime_data(
                list.board.id,
                "edit",
                "list",
                {
                    "list": model_to_dict_data(list),
                    "browser_id": request.headers.get("Browser-ID"),
                },
            )

            # Rediect to current board if delete success
            return redirect(reverse("board", args=[list.board.id]))

        else:
            return render(
                request,
                "task/edit_list_view.html",
                {
                    "list": list,
                    "boards": request.user.boards.all(),
                    "form": form,
                },
            )

    return render(
        request,
        "task/edit_list_view.html",
        {
            "list": list,
            "boards": request.user.boards.all(),
            "form": EditListForm(
                initial={
                    "name": list.name,
                }
            ),
        },
    )


# Delete task list
@login_required
def delete_list(request, list_id):
    # Get list by list_id
    list = List.objects.filter(id=list_id).first()
    if list is None:
        return apology(request, "List does not exist!", 400)

    # Check if the user is member of the board associated with this list
    if request.user not in list.board.members.all():
        return apology(request, "Board does not exist!", 400)

    # Delete on method POST
    if request.method == "POST":

        # Delete board
        list.delete()

        # Realtime update FE
        send_realtime_data(
            list.board.id,
            "delete",
            "list",
            {"id": list_id, "browser_id": request.headers.get("Browser-ID")},
        )

        # Rediect to current board if delete success
        return redirect(reverse("board", args=[list.board.id]))

    return apology(request, "Delete not allowed via GET", 400)
