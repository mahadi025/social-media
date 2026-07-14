from django.apps import AppConfig
from django.db.models.signals import post_migrate

class AuthConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.auth"
    label = "accounts"

    def ready(self):
        post_migrate.connect(create_user, sender=self)

def create_user(sender, app_config, **kwargs):
    if app_config.label != "accounts":
        return

    User = app_config.get_model("User")

    if User.objects.exists():
        return

    admin, admin_created = User.objects.get_or_create(
        email="admin@lms.com",
        is_staff=True,
        is_superuser=True,
        is_active=True,
    )
    admin.set_password("admin")
    admin.save()

    if admin_created:
        print("Superadmin created")
