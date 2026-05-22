from django.urls import path
from .views import ProductListAPIView, OrderCreateAPIView, UserOrderListAPIView, apply_promo

urlpatterns = [
    path('products/', ProductListAPIView.as_view(), name='product-list'),
    path('orders/', OrderCreateAPIView.as_view(), name='order-create'),
    path('my-orders/', UserOrderListAPIView.as_view(), name='my-orders'),
    path('apply-promo/', apply_promo, name='apply-promo'),
]
