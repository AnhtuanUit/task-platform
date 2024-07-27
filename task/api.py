import json
from decimal import Decimal
from django.db.models import Max
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

from .helpers import (
    apology,
    model_to_dict_data,
    reindex_card_position,
    reindex_list_position,
)
from .notifications import (
    send_realtime_data,
    createNotification,
)

from .models import (
    Board,
    User,
    List,
    Card,
)


# TASK LIST APIs
# API create task list
@csrf_exempt
@login_required
def add_list(request, board_id):

    # Check if request is POST
    if request.method == "POST":
        # Check if board exist and get it
        board = request.user.boards.filter(id=board_id).first()

        if board is None:
            # Return error: board does not exists
            return JsonResponse({"error": "Board does not exist!"}, status=400)

        # Prepare list data
        data = json.loads(request.body)
        name = data.get("name")

        # Validate list data
        if not name:
            # Return error: name can not be empty
            return JsonResponse({"error", "Field name cannot be blank!"}, status=400)

        try:
            # Add list to board in DB
            max_position = (
                List.objects.filter(board=board).aggregate(Max("position"))[
                    "position__max"
                ]
                or 0
            )

            # Compute the next position
            next_position = max_position + 100 - (max_position + 100) % 100

            list = List(name=name, board=board, position=next_position)
            list.save()

            # Realtime update FE
            send_realtime_data(
                list.board.id,
                "create",
                "list",
                {
                    "list": model_to_dict_data(list),
                    "browser_id": request.headers.get("Browser-ID"),
                },
            )

            # Create notificaiton and send realtime
            createNotification(request.user, "LIST_CREATED", list)

        except Exception as error:
            print(error)
            # Return error message
            return JsonResponse({"error": "Add list error!"}, status=400)

        # Return successfully message
        return JsonResponse({"message": "Add list successfully."})


# API update task list
@csrf_exempt
def list(request, list_id):

    # Check if list exist
    list = List.objects.filter(id=list_id).first()
    if list is None:
        return JsonResponse({"error": "List does not exist"}, status=400)

    # Update list if method is PUT
    if request.method == "PUT":

        # Prepare PUT data
        card_id = request.PUT["card_id"]

        # Validate PUT data
        card = Card.objects.filter(id=card_id).first()
        if card is None:
            return JsonResponse({"error": "Card does not exists!"}, staus=400)

        # Update the list's card reference
        list.card = card
        list.save()

        # Return successfully message
        return JsonResponse({"message": "Updated list successfully."})


# API move task list
@csrf_exempt
def move_list(request, list_id):

    # Check if list exists
    list = List.objects.filter(id=list_id).first()
    if list is None:
        return JsonResponse({"error": "List does not exist!"}, status=400)

    # Check if request is PUT
    if request.method == "PUT":
        # Check Content-Type to determine how to handle the request data
        content_type = request.headers.get("Content-Type", "")

        if "application/json" in content_type:
            # Handle JSON data in request body
            try:
                data = json.loads(request.body)
                try:
                    data = json.loads(request.body)
                    prev_list_id = data.get("prevListId", None)
                except json.JSONDecodeError as e:
                    print(f"Error decoding JSON: {e}")
                    prev_list_id = None
            except json.JSONDecodeError:
                return JsonResponse({"error": "Invalid JSON"}, status=400)
        elif "multipart/form-data" in content_type:
            # Handle form data
            prev_list_id = request.POST.get("prevListId", None)
        else:
            return JsonResponse({"error": "Unsupported Media Type"}, status=415)

        # If no pre_list so prev_position = 0
        if prev_list_id is None:
            prev_position = 0
        else:
            prev_list = List.objects.filter(
                id=prev_list_id, board_id=list.board.id
            ).first()
            if prev_list is None:
                return JsonResponse(
                    {"error": "Previous list does not exist!"}, status=400
                )
            prev_position = prev_list.position

        # Find next list position
        contiguous_lists = List.objects.filter(
            board_id=list.board_id, position__gte=prev_position
        ).order_by("position")[:2]

        if prev_list_id is None:
            next_list = contiguous_lists[0] if len(contiguous_lists) > 0 else None
        else:
            next_list = contiguous_lists[1] if len(contiguous_lists) > 1 else None

        if next_list is None:
            max_position = prev_position
            next_position = max_position + 100 - (max_position + 100) % 100
        else:
            next_position = next_list.position

        # Update list with new position
        list.position = Decimal((prev_position + next_position) / 2)
        list.save()

        # We reindex list position if these index to closest
        if next_position - list.position < 1:
            reindex_list_position()

            # Find the list after reindex
            list = List.objects.filter(id=list.id).first()

        # Realtime update FE
        send_realtime_data(
            list.board.id,
            "move",
            "list",
            {
                "list": model_to_dict_data(list),
                "browser_id": request.headers.get("Browser-ID"),
            },
        )

        # Return success JSON response
        return JsonResponse({"message": "Move list succssfully."})


# CARD APIs
# API create card
@csrf_exempt
@login_required
def add_card(request, list_id):

    # Check if request is POST
    if request.method == "POST":
        # Check if list exist and get it
        list = List.objects.filter(id=list_id).first()
        if list is None:
            # Return error: list does not exists
            return JsonResponse({"error": "List does not exist!"}, status=400)

        # Prepare list data
        data = json.loads(request.body)
        title = data.get("title")

        # Validate list data
        if not title:
            # Return error: description can not be empty
            return JsonResponse({"error", "Field title cannot be blank!"}, status=400)

        try:
            # Max card position of the list
            max_position = (
                Card.objects.filter(list=list).aggregate(Max("position"))[
                    "position__max"
                ]
                or 0
            )

            # Compute the next position
            next_position = max_position + 100 - (max_position + 100) % 100

            # Add card to list in DB
            card = Card.objects.create(title=title, list=list, position=next_position)
            card.members.add(request.user)
            card.save()

            # Realtime update FE
            send_realtime_data(
                card.list.board.id,
                "create",
                "card",
                {
                    "card": model_to_dict_data(card),
                    "browser_id": request.headers.get("Browser-ID"),
                },
            )

            # Create notificaiton and send realtime
            createNotification(request.user, "TASK_CREATED", card)

        except Exception as error:
            print(error)
            # Return error message
            return JsonResponse({"error": "Add card error!"}, status=400)

        # Return successfully message
        return JsonResponse({"message": "Add card successfully."})


# API move card
@csrf_exempt
def move_card(request, card_id):

    # Check card exist
    card = Card.objects.filter(id=card_id).first()
    if card is None:
        return JsonResponse({"error": "Card does not exist!"}, status=400)

    # Check if request method is PUT
    if request.method == "PUT":

        # Parse data: preCardId, listId
        data = json.loads(request.body)
        try:
            prev_card_id = data.get("prevCardId")
            list_id = data.get("listId")
        except:
            prev_card_id = None
            list_id = None

        # Vaildate data
        list = (
            List.objects.filter(id=list_id).first()
            if list_id is not None
            else card.list
        )
        prev_card = (
            Card.objects.filter(id=prev_card_id, list=list).first()
            if prev_card_id is not None
            else None
        )

        # Case 1: listId empty -> current list
        # Case 2: preCardId empty -> move to first position

        # If no pre_card so prev_position = 0
        if prev_card_id is None:
            prev_position = 0
        else:
            if prev_card is None:
                return JsonResponse(
                    {"error": "Previous list does not exist!"}, status=400
                )
            prev_position = prev_card.position

        # Find next card position
        contiguous_cards = Card.objects.filter(
            list=list, position__gte=prev_position
        ).order_by("position")[:2]

        if prev_card_id is None:
            next_card = contiguous_cards[0] if len(contiguous_cards) > 0 else None
        else:
            next_card = contiguous_cards[1] if len(contiguous_cards) > 1 else None

        if next_card is None:
            # Compute the next position
            max_position = prev_position
            next_position = max_position + 100 - (max_position + 100) % 100
        else:
            next_position = next_card.position

        # Update list with new position
        card.position = Decimal((prev_position + next_position) / 2)
        if card.list is not list:
            card.list = list
        card.save()

        # We reindex card position if these index to closest
        if next_position - card.position < 1:
            reindex_card_position(card)
            # Find the card after reindex
            card = Card.objects.filter(id=card_id).first()

        # Realtime update FE
        send_realtime_data(
            list.board.id,
            "move",
            "card",
            {
                "card": model_to_dict_data(card),
                "browser_id": request.headers.get("Browser-ID"),
            },
        )

        # If task move to list "Done"
        if list_id != None and list.name == "Done":
            # Create notificaiton and send realtime
            createNotification(request.user, "TASK_DONE", card)

        # Return success JSON response
        return JsonResponse({"message": "Move card succssfully."})


# BOARD APIs
# API create board, API get list board
@csrf_exempt
def boards(request):

    # Handle create board
    # Check if request is POST method
    if request.method == "POST":

        try:
            data = json.loads(request.body)
            # Prepare board data
            name = data.get("name")
            description = data.get("description")

            # Validate board data
            if not name:

                # Return error json format
                return JsonResponse(
                    {"error": "Field name cannot be blank!"}, status=400
                )

            try:
                # Create board in DB
                new_board = Board.objects.create(name=name, description=description)
                new_board.members.add(request.user)
                new_board.save()

            except Exception as error:
                print(error)

                # Return error json format
                return JsonResponse({"error": "Create board error!"}, status=400)

            # Return successfully json format
            return JsonResponse({"message": "Created board successfully."})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Handle get list board
    return JsonResponse({"boards": request.user.boards.all()})


# API create board member
@login_required
@csrf_exempt
def board_member(request, board_id):

    # Check if request method is POST
    if request.method == "POST":

        # Check if board exist and get it
        board = request.user.boards.filter(id=board_id).first()

        if board is None:
            return JsonResponse({"error": "Board does not exists!"}, status=400)

        # Prepare member data
        data = json.loads(request.body)
        email = data.get("email")

        # Check if user email exist
        member = User.objects.filter(email=email).first()
        if member is None:
            return JsonResponse({"error": "User does not exist!"}, status=400)

        try:
            # Add member to board
            if not board.members.filter(id=member.id).exists():
                board.members.add(member)
                board.save()

                # Model to dict
                members_dict = [
                    {"id": member.id, "username": member.username}
                    for member in board.members.all()
                ]

                # Realtime update FE
                send_realtime_data(
                    board.id,
                    "create",
                    "board_member",
                    {
                        "members": members_dict,
                        "browser_id": request.headers.get("Browser-ID"),
                    },
                )

                # Return successfully message
                return JsonResponse({"message": "Member added successfully"})
            else:
                return JsonResponse({"error": "Member already added!"}, status=400)
        except Exception as error:
            print(error)
            return JsonResponse({"error": "Cannot add member to board!"}, status=400)


# NOTIFICATION APIs
# API get recent notifications
@csrf_exempt
@login_required
def get_notifications(request):

    # Get the recent 10 notifications
    notifications = request.user.notifications.all().order_by("-created_at")
    notifications_list = []
    total_unread_notification = request.user.notifications.filter(is_read=False).count()

    for notification in notifications:
        notifications_list.append(model_to_dict_data(notification))

    return JsonResponse(
        {
            "notifications": notifications_list,
            "total_unread_notification": total_unread_notification,
        }
    )


# API read notification
@csrf_exempt
@login_required
def read_notification(request, notification_id):

    # Check if notification exist
    notification = request.user.notifications.filter(id=notification_id).first()

    if notification is None:
        return JsonResponse({"message": "Notification does not eixst!"}, 400)

    # Only read by method POST
    if request.method == "POST":

        # Mark as read notification
        notification.is_read = True
        notification.save()

        # Real time send notification
        send_realtime_data_to_user(
            request.user,
            "read",
            "notification",
            {"notification": model_to_dict_data(notification)},
        )

        return JsonResponse({"message": "Read notification successfully."})
