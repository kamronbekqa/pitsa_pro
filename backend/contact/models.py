from django.db import models

class Message(models.Model):
    name = models.CharField(max_length=200, verbose_name="Ism")
    phone = models.CharField(max_length=50, verbose_name="Telefon")
    text = models.TextField(verbose_name="Xabar")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yuborilgan vaqt")

    def __str__(self):
        return f"Xabar: {self.name} - {self.phone}"
    
    class Meta:
        verbose_name = "Xabar"
        verbose_name_plural = "Xabarlar"
