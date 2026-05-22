from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0003_order_customer_status_updated_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='cancellation_reason',
            field=models.TextField(blank=True, verbose_name='Bekor qilish sababi'),
        ),
    ]
