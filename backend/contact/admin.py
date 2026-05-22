from django.contrib import admin
from django.utils.text import Truncator
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'message_text', 'created_at')
    readonly_fields = ('name', 'phone', 'text', 'created_at')
    search_fields = ('name', 'phone', 'text')
    list_filter = ('created_at',)
    ordering = ('-created_at',)

    @admin.display(description="Yuborilgan xabar")
    def message_text(self, obj):
        return Truncator(obj.text).chars(90)
    
    def has_add_permission(self, request):
        return False
