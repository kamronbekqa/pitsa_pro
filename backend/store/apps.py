from django.apps import AppConfig

class StoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    verbose_name = "Restoran"
    name = 'store'

    def ready(self):
        import store.signals  # noqa: F401
        
        # Dynamically customize verbose names for Admin display without modifying database or models.py
        try:
            from .models import Product, PromoCode, Order
            from django.contrib.auth import get_user_model
            
            # Customize Menu Items
            Product._meta.verbose_name = "Menyu elementi"
            Product._meta.verbose_name_plural = "Menyu elementlari"
            
            # Customize Promo codes to Discounts
            PromoCode._meta.verbose_name = "Chegirma kodi"
            PromoCode._meta.verbose_name_plural = "Chegirmalar"
            
            # Customize Orders
            Order._meta.verbose_name = "Buyurtma"
            Order._meta.verbose_name_plural = "Buyurtmalar"
            
            # Customize Users/Auth User to Customers
            User = get_user_model()
            User._meta.verbose_name = "Mijoz"
            User._meta.verbose_name_plural = "Mijozlar"
        except Exception:
            pass
