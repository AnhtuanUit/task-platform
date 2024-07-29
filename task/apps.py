from django.apps import AppConfig


class TaskTrackConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "task"

    def ready(self):
        import task.signals
