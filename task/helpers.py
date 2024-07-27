from django.shortcuts import render
from django.forms.models import model_to_dict
import json
import decimal
from django.db.models.fields.files import FieldFile


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

    return render(
        request,
        "task/apology.html",
        {"top": code, "bottom": escape(message), "boards": request.user.boards.all()},
    )


def handle_uploaded_file(f):
    with open("task/static/upload/upload_image.png", "wb+") as destination:
        for chunk in f.chunks():
            destination.write(chunk)


class DecimalAndFileFieldEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        if isinstance(obj, FieldFile):
            return obj.url if obj else None
        return super(DecimalAndFileFieldEncoder, self).default(obj)


def json_dumps(dict_data):
    data_json = json.dumps(dict_data, cls=DecimalAndFileFieldEncoder)
    return data_json


def model_to_dict_data(model_data):
    dict_data = model_to_dict(model_data)
    if hasattr(model_data, "created_at"):
        dict_data["created_at"] = model_data.created_at.isoformat()

    if hasattr(model_data, "due_date"):
        dict_data["due_date"] = model_data.due_date.isoformat()

    if hasattr(model_data, "members"):
        dict_data["members"] = [
            {"id": member.id, "username": member.username}
            for member in model_data.members.all()
        ]

    return dict_data
