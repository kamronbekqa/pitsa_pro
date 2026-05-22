from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Product(models.Model):
    name = models.CharField(max_length=200, verbose_name="Pitsa nomi")
    description = models.TextField(verbose_name="Tarkibi")
    price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Narxi (so'm)")
    image = models.ImageField(upload_to="products/", null=True, blank=True, verbose_name="Rasm")
    is_active = models.BooleanField(default=True, verbose_name="Sotuvda mavjud")
    is_featured = models.BooleanField(default=False, verbose_name="Slayderda ko'rsatish")

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Menyu cardi"
        verbose_name_plural = "Menyu cardlari / Pitsalar"

class PromoCode(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name="Promo kod")
    discount_percent = models.PositiveIntegerField(verbose_name="Chegirma foizi")
    is_active = models.BooleanField(default=True, verbose_name="Faol")

    def __str__(self):
        return f"{self.code} ({self.discount_percent}%)"
    
    class Meta:
        verbose_name = "Promo Kod"
        verbose_name_plural = "Promo Kodlar"

class Order(models.Model):
    STATUS_ACCEPTED = 'accepted'
    STATUS_APPROVED = 'approved'
    STATUS_DELIVERING = 'delivering'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_ACCEPTED, "Buyurtma qabul qilindi"),
        (STATUS_APPROVED, "Buyurtma tasdiqlandi"),
        (STATUS_DELIVERING, "Yetkazib berishga tayyorlanmoqda"),
        (STATUS_COMPLETED, "Buyurtma yakunlandi"),
        (STATUS_CANCELLED, "Buyurtma bekor qilindi"),
    ]

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='orders',
        verbose_name="Foydalanuvchi",
    )
    customer_name = models.CharField(max_length=200, verbose_name="Mijoz ismi")
    customer_phone = models.CharField(max_length=50, verbose_name="Telefon raqam")
    total_price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Jami summa")
    promo_code_used = models.ForeignKey(PromoCode, null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Ishlatilgan promo kod")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACCEPTED, verbose_name="Holati")
    cancellation_reason = models.TextField(blank=True, verbose_name="Bekor qilish sababi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Buyurtma vaqti")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Oxirgi yangilanish")

    @property
    def notification_message(self):
        messages = {
            self.STATUS_ACCEPTED: "Buyurtmangiz qabul qilindi. Admin tasdiqlashini kutyapti.",
            self.STATUS_APPROVED: "Buyurtmangiz tasdiqlandi. Tez orada siz bilan bog'lanamiz.",
            self.STATUS_DELIVERING: "Buyurtmangiz yetkazib berishga tayyorlanmoqda. Sizga bog'lanamiz.",
            self.STATUS_COMPLETED: "Buyurtmangiz yakunlandi. Yoqimli ishtaha!",
            self.STATUS_CANCELLED: f"Buyurtmangiz bekor qilindi. Sabab: {self.cancellation_reason}",
        }
        return messages.get(self.status, self.get_status_display())

    def clean(self):
        if self.status == self.STATUS_CANCELLED and not self.cancellation_reason.strip():
            raise ValidationError({
                'cancellation_reason': "Buyurtmani bekor qilish uchun sabab yozish shart."
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Buyurtma #{self.id} - {self.customer_name}"
    
    class Meta:
        verbose_name = "Buyurtma"
        verbose_name_plural = "User buyurtmalari"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Pitsa")
    quantity = models.PositiveIntegerField(default=1, verbose_name="Soni")
    price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Narxi")

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
    
    class Meta:
        verbose_name = "Buyurtma qismi"
        verbose_name_plural = "Buyurtma qismlari"
