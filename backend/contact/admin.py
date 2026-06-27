from django.contrib import admin
from django.utils.text import Truncator
from django.utils.html import format_html
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender_name', 'phone', 'message_preview', 'formatted_date')
    readonly_fields = ('name', 'phone', 'text', 'created_at')
    search_fields = ('name', 'phone', 'text')
    list_filter = ('created_at',)
    ordering = ('-created_at',)
    list_per_page = 25
    fieldsets = (
        ("Yuboruvchi", {
            'fields': ('name', 'phone'),
        }),
        ("Xabar", {
            'fields': ('text', 'created_at'),
        }),
    )

    @admin.display(description="Ism")
    def sender_name(self, obj):
        return format_html(
            '<strong style="color:#0f172a;">{}</strong>',
            obj.name,
        )

    @admin.display(description="Xabar")
    def message_preview(self, obj):
        return format_html(
            '<span style="color:#64748b;">{}</span>',
            Truncator(obj.text).chars(80),
        )

    @admin.display(description="Sana", ordering="created_at")
    def formatted_date(self, obj):
        return format_html(
            '<span style="color:#64748b;font-size:13px;white-space:nowrap;">{}</span>',
            obj.created_at.strftime("%d.%m.%Y %H:%M"),
        )

    def has_add_permission(self, request):
        return False
