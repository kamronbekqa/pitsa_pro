from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Sum, Q
from .models import Product, PromoCode, Order
from .admin_serializers import (
    AdminProductSerializer, AdminOrderSerializer,
    AdminPromoCodeSerializer, AdminUserSerializer,
)

User = get_user_model()


class IsStaffUser(permissions.BasePermission):
    """Allow access only to staff (admin) users."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


# ─── Dashboard Stats ────────────────────────────────────────────────────────

class AdminStatsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        total_orders = Order.objects.count()
        revenue = (
            Order.objects.filter(status__in=['approved', 'delivering', 'completed'])
            .aggregate(total=Sum('total_price'))['total'] or 0
        )
        active_promos = PromoCode.objects.filter(is_active=True).count()
        total_users = User.objects.count()
        pending_orders = Order.objects.filter(status='accepted').count()

        recent_orders = Order.objects.order_by('-created_at')[:6]
        recent_data = AdminOrderSerializer(
            recent_orders, many=True, context={'request': request}
        ).data

        status_counts = {
            s: Order.objects.filter(status=s).count()
            for s, _ in Order.STATUS_CHOICES
        }

        return Response({
            'total_orders': total_orders,
            'revenue': revenue,
            'active_promos': active_promos,
            'total_users': total_users,
            'pending_orders': pending_orders,
            'recent_orders': recent_data,
            'status_counts': status_counts,
        })


# ─── Orders ─────────────────────────────────────────────────────────────────

class AdminOrderListView(generics.ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminOrderSerializer

    def get_queryset(self):
        qs = Order.objects.all().order_by('-created_at')
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search', '').strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(
                Q(customer_name__icontains=search)
                | Q(customer_phone__icontains=search)
                | Q(customer__username__icontains=search)
            )
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminOrderSerializer
    queryset = Order.objects.all()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


# ─── Products ────────────────────────────────────────────────────────────────

class AdminProductListView(generics.ListCreateAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminProductSerializer

    def get_queryset(self):
        qs = Product.objects.all().order_by('id')
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminProductSerializer
    queryset = Product.objects.all()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


# ─── Promo Codes ─────────────────────────────────────────────────────────────

class AdminPromoCodeListView(generics.ListCreateAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminPromoCodeSerializer
    queryset = PromoCode.objects.all().order_by('id')


class AdminPromoCodeDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminPromoCodeSerializer
    queryset = PromoCode.objects.all()

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


# ─── Users ───────────────────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        qs = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(username__icontains=search) | Q(email__icontains=search)
            )
        return qs
