from django.apps import AppConfig

class ContactConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    verbose_name = "Muloqot"
    name = 'contact'

    def ready(self):
        import contact.signals  # noqa: F401
        
        try:
            from .models import Message
            Message._meta.verbose_name = "Xabar"
            Message._meta.verbose_name_plural = "Xabarlar"
        except Exception:
            pass
