from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserSerializer

from core.telegram_utils import send_telegram_message

@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        # Telegramga xabar yuborish
        text = (
            "<b>👤 Yangi foydalanuvchi ro'yxatdan o'tdi!</b>\n\n"
            f"🆔 <b>ID:</b> {user.id}\n"
            f"👤 <b>Username:</b> {user.username}\n"
            f"📧 <b>Email:</b> {user.email or 'Kiritilmagan'}"
        )
        send_telegram_message(text)
        
        return Response({
            'token': token.key,
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
    username = (request.data.get('username') or '').strip()
    password = request.data.get('password')
    if not username or not password:
        return Response({'error': 'Login va parolni kiriting'}, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    return Response({'error': 'Noto\'g\'ri login yoki parol'}, status=status.HTTP_401_UNAUTHORIZED)
