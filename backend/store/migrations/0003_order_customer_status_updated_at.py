from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('store', '0002_product_is_featured'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='customer',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to=settings.AUTH_USER_MODEL, verbose_name='Foydalanuvchi'),
        ),
        migrations.AddField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('accepted', 'Buyurtma qabul qilindi'), ('approved', 'Buyurtma tasdiqlandi'), ('delivering', 'Yetkazib berishga tayyorlanmoqda'), ('completed', 'Buyurtma yakunlandi'), ('cancelled', 'Buyurtma bekor qilindi')], default='accepted', max_length=20, verbose_name='Holati'),
        ),
        migrations.AddField(
            model_name='order',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, verbose_name='Oxirgi yangilanish'),
        ),
    ]
