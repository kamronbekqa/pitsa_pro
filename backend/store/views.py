from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Product, PromoCode, Order
from .serializers import ProductSerializer, OrderSerializer

class ProductListAPIView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

class OrderCreateAPIView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]

class UserOrderListAPIView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).order_by('-updated_at', '-created_at')

@api_view(['POST'])
def apply_promo(request):
    code = request.data.get('code')
    try:
        promo = PromoCode.objects.get(code=code, is_active=True)
        return Response({'valid': True, 'discount_percent': promo.discount_percent, 'id': promo.id})
    except PromoCode.DoesNotExist:
        return Response({'valid': False, 'error': "Noto'g'ri yoki yaroqsiz promo kod"}, status=status.HTTP_400_BAD_REQUEST)
