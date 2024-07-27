import os
import mimetypes
from django.conf import settings
from django.urls import reverse
from django.shortcuts import render, redirect
from django.http import HttpResponse
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
    User,
    List,
    Card,
    Attachment,
)

from ..forms import (
    EditCardTitleForm,
    EditCardForm,
    CreateAttachmentForm,
)


# Create card view
def create_card_view(request, list_id):

    # Check if list exists
    list = List.objects.filter(id=list_id).first()
    if list is None:
        return HttpResponse("List does not exist")

    # Render list_add_card.html file
    return render(
        request,
        "task/list_add_card.html",
        {"list": list, "boards": request.user.boards.all()},
    )


# Get card by id view
@login_required
def card_view(request, card_id):

    # Check if card exist
    card = Card.objects.filter(id=card_id).first()
    if card is None:
        return apology(request, "Card does not exist!", 400)

    # Check if use is board member
    if request.user not in card.list.board.members.all():
        return apology(request, "Forbidden.", 403)

    card_members = card.members.all()
    attachments = card.attachments.all()

    return render(
        request,
        "task/card.html",
        {
            "card": card,
            "board": card.list.board,
            "boards": request.user.boards.all(),
            "card_members": card_members,
            "attachments": attachments,
        },
    )


# Edit card title view
@login_required
def edit_card_view_title_view(request, card_id):

    # Check if card eixst
    card = Card.objects.filter(id=card_id).first()
    if card is None:
        return apology(request, "Card does not exist!", 400)

    # Check if card belong to user
    if request.user not in card.list.board.members.all():
        return apology(request, "Card does not exist!", 400)

    # Edit card by POST request
    if request.method == "POST":

        form = EditCardTitleForm(request.POST)

        # Validate form data
        if form.is_valid():
            # Prepare form data
            title = form.cleaned_data["title"]

            # Update card to DB
            card.title = title
            card.save()

            # Realtime update FE
            send_realtime_data(
                card.list.board.id,
                "edit",
                "card",
                {
                    "card": model_to_dict_data(card),
                    "browser_id": request.headers.get("Browser-ID"),
                },
            )

            # Create notificaiton and send realtime
            createNotification(request.user, "TASK_UPDATED_TITLE", card)

            # Redirect to current board
            return redirect(reverse("board", args=[card.list.board.id]))

        else:
            return render(
                request,
                "task/edit_card_view_title_view.html",
                {"boards": request.user.boards.all(), "card": card, "form": form},
            )

    return render(
        request,
        "task/edit_card_view_title_view.html",
        {
            "boards": request.user.boards.all(),
            "card": card,
            "form": EditCardTitleForm(initial={"title": card.title}),
        },
    )


# Edit card view
@login_required
def edit_card_view(request, card_id):

    # Check if card eixst
    card = Card.objects.filter(id=card_id).first()
    if card is None:
        return apology(request, "Card does not exist!", 400)

    # Check if card belong to user
    if request.user not in card.list.board.members.all():
        return apology(request, "Card does not exist!", 400)

    # Get member_choices
    card_members = card.members.all()
    all_board_members = card.list.board.members.all()
    member_choices = [("", "Add member")]
    member_choice_instances = []

    for member in all_board_members:
        if member not in card_members:
            member_choices.append((member.id, member.email))
            member_choice_instances.append(member)

    # Edit card by POST request
    if request.method == "POST":

        form = EditCardForm(request.POST, initial_choices=member_choices)

        # Validate form data
        if form.is_valid():
            # Prepare form data
            title = form.cleaned_data["title"]
            description = form.cleaned_data["description"]
            due_date = form.cleaned_data["due_date"]
            member_id = form.cleaned_data["member_id"]

            # Get member
            if member_id:
                member = User.objects.filter(id=member_id).first()
                if member not in member_choice_instances:
                    return apology(request, "Member does not exist!", 400)
                else:
                    # Update card member to DB
                    card.members.add(member)

                    # Create notificaiton and send realtime
                    createNotification(
                        request.user,
                        "TASK_ASSIGNMENT",
                        {"card": card, "assignee": member},
                    )

            # If change description send notification
            if card.description != description:
                # Create notificaiton and send realtime
                createNotification(request.user, "TASK_UPDATED_DESCRIPTION", card)

            # If change title send notification
            if card.title != title:
                # Create notificaiton and send realtime
                createNotification(request.user, "TASK_UPDATED_TITLE", card)

            # Update card to DB
            card.title = title
            card.due_date = due_date
            card.description = description
            card.save()

            # Realtime update FE
            send_realtime_data(
                card.list.board.id,
                "edit",
                "card",
                {
                    "card": model_to_dict_data(card),
                    "browser_id": request.headers.get("Browser-ID"),
                },
            )

            # Redirect to current board
            return redirect(reverse("card", args=[card.id]))

        else:
            return render(
                request,
                "task/edit_card_view.html",
                {"boards": request.user.boards.all(), "card": card, "form": form},
            )

    return render(
        request,
        "task/edit_card_view.html",
        {
            "boards": request.user.boards.all(),
            "card": card,
            "form": EditCardForm(
                initial={
                    "title": card.title,
                    "description": card.description,
                    "due_date": card.due_date,
                },
                initial_choices=member_choices,
            ),
        },
    )


# Delete card
@login_required
def delete_card(request, card_id):

    # Check if card exist
    card = Card.objects.filter(id=card_id).first()
    if card is None:
        return apology(request, "Card does not exist!", 400)

    # Check if user have permission
    if not request.user in card.members.all():
        return apology(request, "You don't have permission!", 400)

    # Delete by request method POST
    if request.method == "POST":

        # Delete card from DB
        card.delete()

        # Realtime update FE
        send_realtime_data(
            card.list.board.id,
            "delete",
            "card",
            {"id": card_id, "browser_id": request.headers.get("Browser-ID")},
        )

        # Redirect to board page
        return redirect(reverse("board", args=[card.list.board.id]))

    # DELETE operation should not use GET method
    return apology(request, "Delete not allowed via GET", 400)


# Create card attachment file view
@login_required
def create_attachment_file_view(request, card_id):
    # Check if card exsits
    card = Card.objects.filter(id=card_id).first()
    if card is None:
        return apology(request, "Card does not exist!", 400)

    # Check if user is board member
    if request.user not in card.list.board.members.all():
        return apology(request, "Forbidden.", 403)

    form = CreateAttachmentForm(request.POST, request.FILES)
    if request.method == "POST":
        if form.is_valid():

            # Cleaned data
            title = form.cleaned_data["title"]

            # Create attachment
            attachment = Attachment(file=request.FILES["file"], card=card, title=title)
            attachment.save()

            # Realtime update FE
            send_realtime_data(
                card.list.board.id,
                "create",
                "attachment_file",
                {
                    "attachment": model_to_dict_data(attachment),
                    "browser_id": request.headers.get("Browser-ID"),
                },
            )

            # Redirect to current card
            return redirect(reverse("card", args=[card.id]))

        else:
            return render(
                request,
                "task/create_attachment_file_view.html",
                {
                    "card": card,
                    "form": form,
                    "boards": request.user.boards.all(),
                },
            )

    return render(
        request,
        "task/create_attachment_file_view.html",
        {
            "card": card,
            "form": CreateAttachmentForm(),
            "boards": request.user.boards.all(),
        },
    )


# Delete card attachment file
@login_required
def delete_attachment_file(request, attachment_id):
    # Check if attachement exist
    attachment = Attachment.objects.filter(id=attachment_id).first()
    if attachment is None:
        return apology(request, "Attachment does not exist!", 400)

    # Check if user not belong to the board of attachement
    if request.user not in attachment.card.list.board.members.all():
        return apology(request, "Forbidden.", 403)

    # Check if method is POST
    if request.method == "POST":

        # Delete attachment instance
        attachment.delete()

        # Realtime update FE
        send_realtime_data(
            attachment.card.list.board.id,
            "delete",
            "attachment_file",
            {"id": attachment_id, "browser_id": request.headers.get("Browser-ID")},
        )

        # Redirect to current card
        return redirect(reverse("card", args=[attachment.card.id]))

    else:
        # Operate DELETE cannot be perform by GET method
        return apology(request, "Delete not allowed via GET", 400)


# Serve uploaded file
@login_required
def serve_file(request, file_path):
    # Check if the user has permission to access the file
    # if not request.user.has_perm("app_name.view_file"):
    #     raise Http404("You do not have permission to access this file.")

    file_path = os.path.join(settings.MEDIA_ROOT, file_path)
    if os.path.exists(file_path):
        with open(file_path, "rb") as fh:
            mime_type, _ = mimetypes.guess_type(file_path)
            response = HttpResponse(fh.read(), content_type=mime_type)
            response["Content-Disposition"] = (
                f"inline; filename={os.path.basename(file_path)}"
            )
            return response
    else:
        return apology(request, "Find not found.")


# Card members view
@login_required
def card_members_view(request, card_id):

    # Chek if card exist
    card = Card.objects.filter(id=card_id).first()
    if card is None:
        return apology(request, "Card does not exist!", 400)

    # Check if user is card member
    if not request.user in card.members.all():
        return apology(request, "Forbidden.", 403)

    members = card.members.all()
    for index, member in enumerate(members, start=1):
        member.index = index

    return render(
        request,
        "task/card_members.html",
        {
            "card": card,
            "boards": request.user.boards.all(),
            "members": members,
        },
    )


# Delete card member
@login_required
def delete_card_member(request, card_id):

    # Chek if card exist
    card = Card.objects.filter(id=card_id).first()
    if card is None:
        return apology(request, "Card does not exist!", 400)

    # Check if user is card member
    if not request.user in card.members.all():
        return apology(request, "Forbidden.", 403)

    if request.method == "POST":

        # Get delete data
        member_id = request.POST["memberId"]

        # Get member
        member = User.objects.filter(id=member_id).first()
        card.members.remove(member)

        # Realtime update FE
        send_realtime_data(
            card.list.board.id,
            "edit",
            "card",
            {
                "card": model_to_dict_data(card),
                "browser_id": request.headers.get("Browser-ID"),
            },
        )

        return redirect(reverse("card_members", args=[card_id]))
