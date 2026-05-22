from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from core.telegram_utils import send_telegram_message

@receiver(post_save, sender=Order)
def notify_new_order(sender, instance, created, **kwargs):
    if created:
        items_text = ""
        for item in instance.items.all():
            items_text += f"- {item.product.name} x {item.quantity} ({item.price} so'm)\n"
        
        text = (
            "<b>🍕 Yangi buyurtma keldi!</b>\n\n"
            f"🆔 <b>Buyurtma ID:</b> #{instance.id}\n"
            f"👤 <b>Mijoz:</b> {instance.full_name}\n"
            f"📞 <b>Telefon:</b> {instance.phone}\n"
            f"📍 <b>Manzil:</b> {instance.address}\n"
            f"💰 <b>Jami summa:</b> {instance.total_amount} so'm\n\n"
            "📦 <b>Mahsulotlar:</b>\n"
            f"{items_text}"
        )
        send_telegram_message(text)
