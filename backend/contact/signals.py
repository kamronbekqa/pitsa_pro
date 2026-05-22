from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message
from core.telegram_utils import send_telegram_message

@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    if created:
        text = (
            "<b>📩 Yangi xabar keldi!</b>\n\n"
            f"👤 <b>Ism:</b> {instance.name}\n"
            f"📞 <b>Telefon:</b> {instance.phone}\n"
            f"📝 <b>Xabar:</b> {instance.text}"
        )
        send_telegram_message(text)
