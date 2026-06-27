from django.urls import path
from . import admin_views
from contact.admin_views import AdminMessageListView, AdminMessageDetailView

urlpatterns = [
    # Dashboard statistics
    path('stats/', admin_views.AdminStatsView.as_view(), name='admin-stats'),

    # Orders
    path('orders/', admin_views.AdminOrderListView.as_view(), name='admin-orders'),
    path('orders/<int:pk>/', admin_views.AdminOrderDetailView.as_view(), name='admin-order-detail'),

    # Products / Pizzas
    path('products/', admin_views.AdminProductListView.as_view(), name='admin-products'),
    path('products/<int:pk>/', admin_views.AdminProductDetailView.as_view(), name='admin-product-detail'),

    # Promo Codes
    path('promocodes/', admin_views.AdminPromoCodeListView.as_view(), name='admin-promocodes'),
    path('promocodes/<int:pk>/', admin_views.AdminPromoCodeDetailView.as_view(), name='admin-promocode-detail'),

    # Users
    path('users/', admin_views.AdminUserListView.as_view(), name='admin-users'),

    # Contact Messages
    path('messages/', AdminMessageListView.as_view(), name='admin-messages'),
    path('messages/<int:pk>/', AdminMessageDetailView.as_view(), name='admin-message-detail'),
]
