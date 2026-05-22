from django.urls import path
from .views import MessageCreateAPIView

urlpatterns = [
    path('messages/', MessageCreateAPIView.as_view(), name='message-create'),
]
