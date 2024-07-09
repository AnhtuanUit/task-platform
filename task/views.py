import json
import math
from django.shortcuts import render, redirect
from django.db.models import Prefetch, Max
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from decimal import Decimal

from .models import (
    Board,
    User,
    List,
    Label,
    Card,
    Assignment,
    Notification,
)

# Login, logout, edit profile


# Create your views here.
# show boards here
def index(request):
    # Show boards, lists, cards
    boards = Board.objects.all()
    return render(request, "task/index.html", {"boards": boards})


def profile_view(request):

    return render(request, "task/profile.html", {"boards": boards})


# Login
def login_view(request):

    # Handle login logic
    if request.method == "POST":

        # Get username, password
        username = request.POST["username"]
        password = request.POST["password"]

        # Check username, password
        user = authenticate(username=username, password=password)

        # Trow error if invalid credential
        if user is not None:
            # Log user in
            login(request, user)

            # Render index page if login success
            return redirect("index")
        else:
            return render(request, "task/login.html", {"message": "Invalid login"})

    # Render login page
    return render(request, "task/login.html")


# Register
def register_view(request):

    # Handle register
    if request.method == "POST":

        # Get username, password, email, first_name, last_name,
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        # Check confirmation password
        if password is not confirmation:

            # Error: confirmation password not match
            return render(
                request,
                "task/register.html",
                {"message": "confirmation password not match"},
            )

        # Check if username exist
        if User.objects.filter(username=username).first():

            # Error: user already exist
            return render(
                request, "task/register.html", {"message": "Username already exist"}
            )
        # Check if email exist
        if User.objects.filter(email=email).first():

            # Error: user already exist
            return render(
                request, "task/register.html", {"message": "Email already exist"}
            )

        # Create user
        user = User.objects.create_user(username, email, password)

        # Login user
        if user is not None:
            login(request, user)

        # Redirect to index page
        return redirect("index")

    # Render register page
    return render(request, "task/register.html")


# Logout
def logout_view(request):
    if request.user.is_authenticated:
        logout(request)

    return redirect("login")


# - Create a board for a project
def create_board_view(request):
    return render(request, "task/new_board.html", {"boards": Board.objects.all()})


# -  Board add list
def board_add_list_view(request, board_id):

    # Check if board exist
    board = Board.objects.filter(id=board_id).first()
    if board is None:
        return HttpResponse("Board not found!")

    return render(
        request,
        "task/board_add_list.html",
        {"board": board, "boards": Board.objects.all()},
    )


# - List add card: descriptions, due dates, labels, and attachments.
def list_add_card_view(request, list_id):

    # Check if list exists
    list = List.objects.filter(id=list_id).first()
    if list is None:
        return HttpResponse("List does not exist")

    # Render list_add_card.html file
    return render(
        request,
        "task/list_add_card.html",
        {"list": list, "boards": Board.objects.all()},
    )


# - Board add member
def board_add_member_view(request, board_id):

    # Chek if board exist
    board = Board.objects.filter(id=board_id).first()
    if board is None:
        return HttpResponse("Board does not exist!")

    # Render board add memeber page
    return render(
        request,
        "task/board_add_member.html",
        {"board": board, "boards": Board.objects.all()},
    )


# TODO: Show boards, lists, cards
# TODO: Show board members
# TODO: Show card detail: …
# TODO: Drag-and-drop functionality to move cards between lists. (Change card of list)

# APIs


#  Show boards, lists, cards
#  Show board members
#  Show card detail: …
#  Drag-and-drop functionality to move cards between lists. (Change card of list)


# APIs
# - API board add list
@csrf_exempt
def add_list(request, board_id):

    # Check if request is POST
    if request.method == "POST":
        # Check if board exist and get it
        board = Board.objects.filter(id=board_id).first()

        if board is None:
            # Return error: board does not exists
            return JsonResponse({"error": "Board does not exist!"})

        # Prepare list data
        data = json.loads(request.body)
        name = data.get("name")

        # Validate list data
        if not name:
            # Return error: name can not be empty
            return JsonResponse({"error", "Field name cannot be blank!"}, status=400)

        try:
            # Add list to board in DB
            max_position = List.objects.filter(board=board).aggregate(Max("position"))[
                "position__max"
            ]

            # Compute the next position
            next_position = max_position + 100 - (max_position + 100) % 100

            List.objects.create(name=name, board=board, position=next_position)
        except:

            # Return error message
            return JsonResponse({"error": "Add list error!"}, status=400)

        # Return successfully message
        return JsonResponse({"messesge": "Add list successfully."})


# APIs
# - API board move list
@csrf_exempt
def move_list(request, list_id):

    # Check if list exists
    list = List.objects.filter(id=list_id).first()
    if list is None:
        return JsonResponse({"message": "List does not exist!"})

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
            # TODO: Fix error: cannot parse data
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
                return JsonResponse({"message": "Previous list does not exist!"})
            prev_position = prev_list.position

        # Find next list position
        contiguous_lists = List.objects.filter(
            board_id=list.board_id, position__gte=prev_position
        ).order_by("position")[:2]

        if prev_list_id is None:
            next_list = contiguous_lists[0] if len(contiguous_lists) > 1 else None
        else:
            next_list = contiguous_lists[1] if len(contiguous_lists) > 1 else None

        if next_list is None:
            max_position = prev_position
            next_position = max_position + 100 - (max_position + 100) % 100
        else:
            next_position = next_list.position

        # TODO: Update list with new position
        list.position = Decimal((prev_position + next_position) / 2)
        list.save()

        # We reindex list position if these index to closest
        if next_position - list.position < 1:
            reindex_list_position()

        # Return success JSON response
        return JsonResponse({"message": "Move list succssfully."})


# - API list add card: descriptions, due dates, labels, and attachments.
@csrf_exempt
def add_card(request, list_id):

    # Check if request is POST
    if request.method == "POST":
        # Check if list exist and get it
        list = List.objects.filter(id=list_id).first()
        if list is None:
            # Return error: list does not exists
            return JsonResponse({"error": "List does not exist!"})

        # Prepare list data
        data = json.loads(request.body)
        description = data.get("description")

        # Validate list data
        if not description:
            # Return error: description can not be empty
            return JsonResponse(
                {"error", "Field description cannot be blank!"}, status=400
            )

        try:
            # Max card position of the list
            max_position = Card.objects.filter(list=list).aggregate(Max("position"))[
                "position__max"
            ]

            # Compute the next position
            next_position = max_position + 100 - (max_position + 100) % 100

            # Add card to list in DB
            Card.objects.create(
                description=description, list=list, position=next_position
            )
        except:
            # Return error message
            return JsonResponse({"error": "Add card error!"}, status=400)

        # Return successfully message
        return JsonResponse({"messesge": "Add card successfully."})


# - API board add member
@csrf_exempt
def board_member(request, board_id):

    # Check if request method is POST
    if request.method == "POST":

        # Check if board exist and get it
        board = Board.objects.filter(id=board_id).first()
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
                # Return successfully message
                return JsonResponse({"message": "Member added successfully"})
            else:
                return JsonResponse({"message": "Member already added!"}, status=400)
        except Exception as error:
            print(error)
            return JsonResponse({"error": "Cannot add member to board!"}, status=400)


# - API create new board
# - API Show boards, lists, cards
@csrf_exempt
def boards(request):

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
                Board.objects.create(name=name, description=description)

            except Exception as error:
                print(error)

                # Return error json format
                return JsonResponse({"error": "Create board error!"}, status=400)

            # Return successfully json format
            return JsonResponse({"message": "Created board successfully."})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Pagination

    # Get all boards items, with members, with list, with card
    boards = Board.objects.prefetch_related("members", "lists__cards")

    # Return list of boards
    return JsonResponse({"boards": boards})


# - API get board by board id
@csrf_exempt
def board(request, board_id):

    board = (
        Board.objects.filter(id=board_id)
        .prefetch_related("members", "lists__cards", "lists")
        .first()
    )

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

    return render(
        request,
        "task/board.html",
        {"board": board, "lists": lists, "boards": Board.objects.all()},
    )


# - API show card detail:attach file, lables, ...
@csrf_exempt
def card(request, card_id):

    # Get card detail and return
    card = Card.objects.filter(id=card_id).first()

    if card is None:
        return JsonResponse({"messag": "Card does not exist!"}, status=400)

    return render(
        request, "task/card.html", {"card": card, "boards": Board.objects.all()}
    )


# - API update card => Drag-and-drop functionality to move cards between lists. (Change card of list)
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


def reindex_card_position():
    lists = Card.objects.values_list("list", flat=True).distinct()

    for list in lists:
        cards_in_list = Card.objects.filter(list=list).order_by("position")
        position = 100
        for card_instance in cards_in_list:
            card_instance.position = Decimal(position)
            card_instance.save()
            position += 100


def reindex_list_position():
    boards = List.objects.values_list("board", flat=True).distinct()

    for board in boards:
        lists_in_board = List.objects.filter(board=board).order_by("position")
        position = 100
        for list_instance in lists_in_board:
            list_instance.position = Decimal(position)
            list_instance.save()
            position += 100


@csrf_exempt
def move_card(request, card_id):

    # Check card exist
    card = Card.objects.filter(id=card_id).first()
    if card is None:
        return JsonResponse({"error": "Card does not exist!"})

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
            list_id=card.list.id, position__gte=prev_position
        ).order_by("position")[:2]

        if prev_card_id is None:
            next_card = contiguous_cards[0] if len(contiguous_cards) > 1 else None
        else:
            next_card = contiguous_cards[1] if len(contiguous_cards) > 1 else None

        if next_card is None:
            # Compute the next position
            # max_position = List.objects.filter(board_id=list.board_id).aggregate(
            #     Max("position")
            # )["position__max"]
            # This meant prev_card_id should be the max position
            max_position = prev_position
            next_position = max_position + 100 - (max_position + 100) % 100
        else:
            next_position = next_card.position

        # TODO: Update list with new position
        card.position = Decimal((prev_position + next_position) / 2)
        if card.list.id is not list.id:
            card.list = list
        card.save()

        # We reindex card position if these index to closest
        if next_position - card.position < 1:
            reindex_card_position()

        # Return success JSON response
        return JsonResponse({"message": "Move list succssfully."})


# TODO: Drag UI and integrate with API for both Card, List - DO THIS
# TODO:1. Action dag acomponent -> can move it [what can touch can drag]
# TODO:2. Action touch a component -> can touch [Touch what do what]
# TODO:3. Call the API and done - Read data of current, and touched
# TODO:4. Replace touched component with placeholder
# TODO:5. Depending on touched: add a placeholder
#     TODO:1. The component
#     TODO:2. The List column but below the last component
#     TODO:3. The first component be touch upper top


# TODO: Touch to show a placeholder
# Move to remove place holder
#
# Or remove old place holder
# Dag to that
# Only handle in case of dag

# ==> DONE right?

# API


"""
# TODO:Move to remove place holder
- For simple ideas, we want, hover to half below component and half above component
- So for each case we trigger a event for:
    1. We create a place holder and add to the side of component (up or down)
    2. We need remove the old placeholder if it exist
- So that it


"""
