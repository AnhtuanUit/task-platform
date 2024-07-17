import json
from django.urls import reverse
from django.shortcuts import render, redirect
from django.db.models import Prefetch, Max
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from decimal import Decimal
from .helpers import apology

from .models import (
    Board,
    User,
    List,
    Card,
)
from django import forms


class EditProfileForm(forms.Form):
    template_name = "form_snippet.html"
    bio = forms.CharField(
        max_length=256,
        widget=forms.TextInput(
            attrs={"class": "form-control w-auto", "placeholder": "Bio"}
        ),
    )
    first_name = forms.CharField(
        max_length=256,
        widget=forms.TextInput(
            attrs={"class": "form-control w-auto", "placeholder": "First name"}
        ),
    )
    last_name = forms.CharField(
        max_length=256,
        widget=forms.TextInput(
            attrs={"class": "form-control w-auto", "placeholder": "Last name"}
        ),
    )


class EditBoardForm(forms.Form):
    template_name = "form_snippet.html"
    name = forms.CharField(
        max_length=256,
        widget=forms.TextInput(
            attrs={"class": "form-control w-auto", "placeholder": "Name"}
        ),
    )
    description = forms.CharField(
        max_length=256,
        widget=forms.TextInput(
            attrs={"class": "form-control w-auto", "placeholder": "Description"}
        ),
    )


class EditListForm(forms.Form):
    template_name = "form_snippet.html"
    name = forms.CharField(
        max_length=256,
        widget=forms.TextInput(
            attrs={"class": "form-control w-auto", "placeholder": "Name"}
        ),
    )


class EditCardTitleForm(forms.Form):
    template_name = "form_snippet.html"
    title = forms.CharField(
        max_length=256,
        widget=forms.TextInput(
            attrs={"class": "form-control w-auto", "placeholder": "Title"}
        ),
    )


class EditCardForm(forms.Form):
    template_name = "form_snippet.html"
    title = forms.CharField(
        max_length=256,
        widget=forms.TextInput(
            attrs={"class": "form-control w-auto", "placeholder": "Title"}
        ),
    )
    description = forms.CharField(
        required=False,
        max_length=256,
        widget=forms.TextInput(
            attrs={"class": "form-control w-auto", "placeholder": "Description"}
        ),
    )
    due_date = forms.DateTimeField(
        required=False,
        widget=forms.DateTimeInput(
            attrs={
                "class": "form-control w-auto",
                "type": "datetime-local",
                "placeholder": "Due date",
                "min": "2018-06-07T00:00",
                "max": "2025-06-14T00:00",
            }
        ),
    )
    member_id = forms.ChoiceField(
        required=False,
        choices=[],
    )

    def __init__(self, *args, **kwargs):
        initial_choices = kwargs.pop("initial_choices", [])
        super(EditCardForm, self).__init__(*args, **kwargs)
        self.fields["member_id"].choices = initial_choices

    # TODO: upload attachments as update card form
    # attachments = models.ManyToManyField("Attachment", related_name="cards")


# Login, logout profile
# Create your views here.
# show boards here
@login_required
def index(request):
    # Show boards, lists, cards
    return render(request, "task/index.html", {"boards": request.user.boards.all()})


@login_required
def profile_view(request, profile_id):

    profile = User.objects.filter(id=profile_id).first()

    return render(
        request,
        "task/profile.html",
        {"boards": request.user.boards.all(), "profile": profile},
    )


@login_required
def edit_profile_view(request, profile_id):

    # Check if this is profile of user
    if request.user.id is not profile_id:
        return HttpResponse("Page not found!")

    # Check if profile exist
    profile = User.objects.filter(id=profile_id).first()
    if profile is None:
        return HttpResponse("Profile does not exist!")

    # Update profile
    if request.method == "POST":

        # Validate
        form = EditProfileForm(request.POST)
        if form.is_valid():
            # Get clean data fields
            bio = form.cleaned_data.get("bio")
            first_name = form.cleaned_data.get("first_name")
            last_name = form.cleaned_data.get("last_name")

            # Update profile
            profile.bio = bio
            profile.first_name = first_name
            profile.last_name = last_name
            profile.save()

            return redirect(reverse("profile", args=[profile_id]))

        else:
            return render(
                request,
                "task/edit_profile.html",
                {"boards": request.user.boards.all(), "profile": profile, "form": form},
            )

    else:
        return render(
            request,
            "task/edit_profile.html",
            {
                "boards": request.user.boards.all(),
                "profile": profile,
                "form": EditProfileForm(
                    initial={
                        "bio": profile.bio,
                        "first_name": profile.first_name,
                        "last_name": profile.last_name,
                    }
                ),
            },
        )


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
    return render(request, "task/new_board.html", {"boards": request.user.boards.all()})


# - Edit board
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


# - Delete board
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

        # Rediect to home page if delete success
        return redirect("index")

    return apology(request, "Delete not allowed via GET", 400)


# -  Board add list
def board_add_list_view(request, board_id):

    # Check if board exist
    board = Board.objects.filter(id=board_id).first()
    if board is None:
        return HttpResponse("Board not found!")

    return render(
        request,
        "task/board_add_list.html",
        {"board": board, "boards": request.user.boards.all()},
    )


# - Edit list
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


# - Delete list
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

        # Rediect to current board if delete success
        return redirect(reverse("board", args=[list.board.id]))

    return apology(request, "Delete not allowed via GET", 400)


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
        {"list": list, "boards": request.user.boards.all()},
    )


# - Edit card title
@login_required
def edit_card_title(request, card_id):

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

            # Redirect to current board
            return redirect(reverse("board", args=[card.list.board.id]))

        else:
            return render(
                request,
                "task/edit_card_title.html",
                {"boards": request.user.boards.all(), "card": card, "form": form},
            )

    return render(
        request,
        "task/edit_card_title.html",
        {
            "boards": request.user.boards.all(),
            "card": card,
            "form": EditCardTitleForm(initial={"title": card.title}),
        },
    )


# - Edit card
@login_required
def edit_card(request, card_id):

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

            # Update card to DB
            card.title = title
            card.due_date = due_date
            card.description = description
            card.save()

            # Redirect to current board
            return redirect(reverse("card", args=[card.id]))

        else:
            return render(
                request,
                "task/edit_card.html",
                {"boards": request.user.boards.all(), "card": card, "form": form},
            )

    return render(
        request,
        "task/edit_card.html",
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


# - Delete card
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

        # Redirect to board page
        return redirect(reverse("board", args=[card.list.board.id]))

    # DELETE operation should not use GET method
    return apology(request, "Delete not allowed via GET", 400)


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
        {"board": board, "boards": request.user.boards.all()},
    )


# TODO: Show board members
# TODO: Show card detail: …

# APIs


#  Show boards, lists, cards
#  Show board members
#  Show card detail: …
#  Drag-and-drop functionality to move cards between lists. (Change card of list)


# APIs
# - API board add list
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

            List.objects.create(name=name, board=board, position=next_position)
        except Exception as error:
            print(error)
            # Return error message
            return JsonResponse({"error": "Add list error!"}, status=400)

        # Return successfully message
        return JsonResponse({"message": "Add list successfully."})


# APIs
# - API board move list
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
                return JsonResponse(
                    {"error": "Previous list does not exist!"}, status=400
                )
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

        except:
            # Return error message
            return JsonResponse({"error": "Add card error!"}, status=400)

        # Return successfully message
        return JsonResponse({"message": "Add card successfully."})


# - API board add member
@csrf_exempt
@login_required
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
                # Return successfully message
                return JsonResponse({"message": "Member added successfully"})
            else:
                return JsonResponse({"error": "Member already added!"}, status=400)
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

    # Pagination

    # Get all boards items, with members, with list, with card
    boards = Board.objects.prefetch_related("members", "lists__cards")

    # Return list of boards
    return JsonResponse({"boards": request.user.boards.all()})


# - API get board by board id
@csrf_exempt
@login_required
def board(request, board_id):

    board = (
        request.user.boards.filter(id=board_id)
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


# - Get card detail:attach file, lables, ...
@csrf_exempt
def card(request, card_id):

    # Get card detail and return
    # TODO: Fix role: card can be seen by all people in board
    card = Card.objects.filter(id=card_id).prefetch_related("members").first()

    if card is None:
        return JsonResponse({"message": "Card does not exist!"}, status=400)

    card_members = card.members.all()

    return render(
        request,
        "task/card.html",
        {
            "card": card,
            "boards": request.user.boards.all(),
            "card_members": card_members,
        },
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


@csrf_exempt
@login_required
def card_member(request, card_id):
    # Check if card exist or not
    card = request.user.cards.filter(id=card_id).first()
    if card is None:
        return JsonResponse({"error": "Card does not exist!"}, status=400)

    # Check if POST request
    if request.method == "POST":

        # Get member id
        data = json.loads(request.body)
        member_id = data.get("memberId")

        # Check if member is a valid user
        member = User.objects.filter(id=member_id).first()
        if member is None:
            # Return a error message
            return JsonResponse({"error": "User does not exist!"}, status=400)

        # Add member to card
        card.members.add(member)
        card.save()

        # Return success message
        return JsonResponse({"message": "Add member to card successfully!"})
