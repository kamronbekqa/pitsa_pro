from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product, PromoCode, Order, OrderItem

User = get_user_model()


class AdminProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'image_url',
                  'is_active', 'is_featured']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class AdminOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image',
                  'quantity', 'price', 'line_total']

    def get_product_image(self, obj):
        if obj.product.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.product.image.url)
            return obj.product.image.url
        return None

    def get_line_total(self, obj):
        return obj.quantity * obj.price


class AdminOrderSerializer(serializers.ModelSerializer):
    items = AdminOrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    customer_username = serializers.SerializerMethodField()
    promo_code_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_username', 'customer_name', 'customer_phone',
            'total_price', 'promo_code_used', 'promo_code_name', 'items',
            'status', 'status_display', 'cancellation_reason',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'customer', 'customer_username', 'customer_name',
            'customer_phone', 'total_price', 'items', 'created_at', 'updated_at',
            'promo_code_used', 'promo_code_name', 'status_display',
        ]

    def get_customer_username(self, obj):
        return obj.customer.username if obj.customer else None

    def get_promo_code_name(self, obj):
        return obj.promo_code_used.code if obj.promo_code_used else None


class AdminPromoCodeSerializer(serializers.ModelSerializer):
    usage_count = serializers.SerializerMethodField()

    class Meta:
        model = PromoCode
        fields = ['id', 'code', 'discount_percent', 'is_active', 'usage_count']

    def get_usage_count(self, obj):
        return Order.objects.filter(promo_code_used=obj).count()


class AdminUserSerializer(serializers.ModelSerializer):
    order_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_active',
                  'date_joined', 'order_count', 'total_spent']

    def get_order_count(self, obj):
        return obj.orders.count()

    def get_total_spent(self, obj):
        from django.db.models import Sum
        result = obj.orders.filter(
            status__in=['approved', 'delivering', 'completed']
        ).aggregate(total=Sum('total_price'))['total']
        return result or 0
