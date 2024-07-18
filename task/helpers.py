from django.shortcuts import render


def apology(request, message, code=400):
    """Render message as an apology to user."""

    def escape(s):
        """
        Escape special characters.

        https://github.com/jacebrowning/memegen#special-characters
        """
        for old, new in [
            ("-", "--"),
            (" ", "-"),
            ("_", "__"),
            ("?", "~q"),
            ("%", "~p"),
            ("#", "~h"),
            ("/", "~s"),
            ('"', "''"),
        ]:
            s = s.replace(old, new)
        return s

    return render(request, "apology.html", {"top": code, "bottom": escape(message)})


def handle_uploaded_file(f):
    with open("task/static/upload/upload_image.png", "wb+") as destination:
        for chunk in f.chunks():
            destination.write(chunk)
