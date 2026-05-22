from django.apps import AppConfig


class StoreConfig(AppConfig):
    verbose_name = "Do'kon boshqaruvi"
    name = 'store'

    def ready(self):
        import store.signals
