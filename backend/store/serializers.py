from rest_framework import serializers
from .models import Product, PromoCode, Order, OrderItem
from core.telegram_utils import send_telegram_message

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = ['code', 'discount_percent']

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    notification_message = serializers.CharField(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id',
            'customer_name',
            'customer_phone',
            'total_price',
            'promo_code_used',
            'items',
            'status',
            'status_display',
            'cancellation_reason',
            'notification_message',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'status_display', 'notification_message', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['customer'] = request.user
        order = Order.objects.create(**validated_data)
        items_text = ""
        for item_data in items_data:
            item = OrderItem.objects.create(order=order, **item_data)
            items_text += f"- {item.product.name}: {item.quantity} x {item.price} so'm\n"
        
        # Telegramga xabar yuborish
        message = (
            f"<b>🆕 Yangi Buyurtma #{order.id}</b>\n\n"
            f"👤 <b>Mijoz:</b> {order.customer_name}\n"
            f"📞 <b>Telefon:</b> {order.customer_phone}\n"
            f"💰 <b>Jami summa:</b> {order.total_price} so'm\n\n"
            f"🛒 <b>Mahsulotlar:</b>\n{items_text}"
        )
        if order.promo_code_used:
            message += f"\n🎟 <b>Promo kod:</b> {order.promo_code_used.code}"
            
        send_telegram_message(message)
        
        return order
