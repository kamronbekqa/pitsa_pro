from rest_framework import generics
from .models import Message
from .serializers import MessageSerializer

class MessageCreateAPIView(generics.CreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
