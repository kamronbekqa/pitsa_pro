from rest_framework import generics
from rest_framework import serializers
from .models import Message
from store.admin_views import IsStaffUser


class AdminMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'name', 'phone', 'text', 'created_at']


class AdminMessageListView(generics.ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminMessageSerializer
    queryset = Message.objects.all().order_by('-created_at')


class AdminMessageDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminMessageSerializer
    queryset = Message.objects.all()
