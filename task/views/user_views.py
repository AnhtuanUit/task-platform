from django.conf import settings
from django.urls import reverse
from django.shortcuts import render, redirect
from django.db.models import Prefetch, Max
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from ..models import User
from ..forms import EditProfileForm


# Home page, show user's boards
@login_required
def index(request):

    return render(
        request,
        "task/index.html",
        {"boards": request.user.boards.all()},
    )


# Profile view
@login_required
def profile_view(request, profile_id):

    profile = User.objects.filter(id=profile_id).first()

    return render(
        request,
        "task/profile.html",
        {"boards": request.user.boards.all(), "profile": profile},
    )


# Edit profile view
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


# Login view
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


# Register view
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


# Logout view
@login_required
def logout_view(request):
    if request.user.is_authenticated:
        logout(request)

    return redirect("login")
