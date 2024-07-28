from django import forms


class EditProfileForm(forms.Form):
    template_name = "form_snippet.html"
    bio = forms.CharField(
        max_length=256,
        widget=forms.TextInput(
            attrs={
                "class": "form-control w-auto",
                "placeholder": "Bio",
                "autofocus": True,
            }
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
            attrs={
                "class": "form-control w-auto",
                "placeholder": "Name",
                "autofocus": True,
            }
        ),
    )
    description = forms.CharField(
        required=False,
        max_length=256,
        widget=forms.Textarea(
            attrs={
                "class": "form-control w-auto",
                "placeholder": "Description",
                "autofocus": True,
                "rows": 4,
                "cols": 38,
            }
        ),
    )


class EditListForm(forms.Form):
    template_name = "form_snippet.html"
    name = forms.CharField(
        max_length=256,
        widget=forms.Textarea(
            attrs={
                "class": "form-control w-auto single-line-textarea",
                "placeholder": "Name",
                "autofocus": True,
                "rows": 4,
                "cols": 38,
            }
        ),
    )


class EditCardTitleForm(forms.Form):
    template_name = "form_snippet.html"
    title = forms.CharField(
        max_length=256,
        widget=forms.Textarea(
            attrs={
                "class": "form-control w-auto single-line-textarea",
                "placeholder": "Title",
                "autofocus": True,
                "rows": 4,
                "cols": 38,
            }
        ),
    )


class EditCardForm(forms.Form):
    template_name = "form_snippet.html"
    title = forms.CharField(
        max_length=256,
        widget=forms.Textarea(
            attrs={
                "class": "form-control w-auto single-line-textarea",
                "placeholder": "Title",
                "autofocus": True,
                "rows": 4,
                "cols": 38,
            }
        ),
    )
    description = forms.CharField(
        required=False,
        max_length=256,
        widget=forms.Textarea(
            attrs={
                "class": "form-control w-auto",
                "placeholder": "Description",
                "autofocus": True,
                "rows": 4,
                "cols": 38,
            }
        ),
    )
    due_date = forms.DateTimeField(
        required=False,
        widget=forms.DateTimeInput(
            format="%Y-%m-%dT%H:%M",
            attrs={
                "class": "form-control w-auto",
                "type": "datetime-local",
            },
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


class CreateAttachmentForm(forms.Form):
    template_name = "form_snippet.html"
    title = forms.CharField(
        max_length=256,
        required=False,
        widget=forms.DateTimeInput(
            attrs={"class": "form-control w-auto", "placeholder": "Title"}
        ),
    )
    file = forms.FileField(
        widget=forms.FileInput(attrs={"class": "form-control w-auto"})
    )
