from django import forms
from django.contrib import admin, messages
from django.contrib.auth.models import Group
from django.shortcuts import get_object_or_404, redirect
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils.text import Truncator
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import Product, PromoCode, Order, OrderItem

# ── Site branding ────────────────────────────────────────────────────────────
admin.site.site_header = "PitsaMaster"
admin.site.site_title = "PitsaMaster"
admin.site.index_title = "Boshqaruv paneli"

# ── Hide technical Django sections ───────────────────────────────────────────
try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass

try:
    from rest_framework.authtoken.models import Token
    admin.site.unregister(Token)
except (ImportError, admin.sites.NotRegistered):
    pass


# ═══════════════════════════════════════════════════════════════════════════════
#  MENU ITEMS (Products)
# ═══════════════════════════════════════════════════════════════════════════════

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'name', 'short_description', 'formatted_price', 'is_active', 'is_featured')
    list_display_links = ('image_preview', 'name')
    list_editable = ('is_active', 'is_featured')
    list_filter = ('is_active', 'is_featured')
    search_fields = ('name', 'description')
    list_per_page = 20
    readonly_fields = ('card_preview',)
    fieldsets = (
        ("Ko'rish", {
            'fields': ('card_preview',),
            'description': "Bu menyu elementining hozirgi ko'rinishi.",
        }),
        ("Ma'lumotlar", {
            'fields': ('name', 'description', 'price', 'image', 'is_active', 'is_featured'),
        }),
    )

    @admin.display(description="Rasm")
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:48px;height:48px;object-fit:cover;'
                'border-radius:10px;border:2px solid #2a2a2a;" />',
                obj.image.url,
            )
        return mark_safe(
            '<div style="width:48px;height:48px;border-radius:10px;background:#222;'
            'display:flex;align-items:center;justify-content:center;color:#666;'
            'font-size:18px;">🍕</div>'
        )

    @admin.display(description="Tarkibi")
    def short_description(self, obj):
        return Truncator(obj.description).chars(60)

    @admin.display(description="Narxi")
    def formatted_price(self, obj):
        if obj.price is None:
            return mark_safe('<span style="color:#666;">—</span>')
        return format_html(
            '<strong style="color:#ffffff;font-size:14px;">{} so\'m</strong>',
            f"{obj.price:,.0f}",
        )

    @admin.display(description="Card preview")
    def card_preview(self, obj):
        if obj and obj.image:
            image_html = format_html(
                '<img src="{}" style="width:140px;height:100px;object-fit:cover;'
                'border-radius:12px;margin-right:20px;" />',
                obj.image.url,
            )
        else:
            image_html = mark_safe(
                '<div style="width:140px;height:100px;border-radius:12px;margin-right:20px;'
                'background:linear-gradient(135deg,#222,#111);display:flex;'
                'align-items:center;justify-content:center;color:#666;font-size:32px;">'
                '🍕</div>'
            )
        name = obj.name if obj and obj.pk else "Yangi element"
        description = obj.description if obj and obj.pk else "Tarkib kiritilmagan"
        price = f"{obj.price:,.0f}" if obj and obj.pk and obj.price is not None else "—"
        return format_html(
            '<div style="display:flex;align-items:center;max-width:640px;padding:16px;'
            'border:1px solid #2a2a2a;border-radius:16px;background:#1a1a1a;'
            'box-shadow:0 4px 12px rgba(0,0,0,0.15);">{}'
            '<div><strong style="font-size:18px;color:#ffffff;">{}</strong>'
            '<p style="margin:6px 0 8px;color:#a0a0a0;font-size:14px;line-height:1.5;">{}</p>'
            '<span style="background:linear-gradient(135deg,#ff6a00,#ffb347);color:#fff;'
            'padding:4px 12px;border-radius:20px;font-weight:700;font-size:14px;">'
            '{} so\'m</span></div></div>',
            image_html, name, Truncator(description).chars(120), price,
        )


# ═══════════════════════════════════════════════════════════════════════════════
#  DISCOUNTS (PromoCodes)
# ═══════════════════════════════════════════════════════════════════════════════

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('formatted_code', 'formatted_discount', 'is_active')
    list_editable = ('is_active',)
    list_filter = ('is_active',)
    search_fields = ('code',)
    list_per_page = 20

    @admin.display(description="Chegirma kodi")
    def formatted_code(self, obj):
        return format_html(
            '<code style="background:#222;color:#ff6a00;padding:4px 10px;border-radius:6px;'
            'font-weight:600;font-size:14px;letter-spacing:0.5px;">{}</code>',
            obj.code,
        )

    @admin.display(description="Chegirma")
    def formatted_discount(self, obj):
        return format_html(
            '<span style="background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;'
            'padding:3px 10px;border-radius:20px;font-weight:700;font-size:13px;">'
            '{}% off</span>',
            obj.discount_percent,
        )


# ═══════════════════════════════════════════════════════════════════════════════
#  ORDERS
# ═══════════════════════════════════════════════════════════════════════════════

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price', 'line_total')
    fields = ('product', 'quantity', 'price', 'line_total')
    can_delete = False
    verbose_name = "Buyurtma tarkibi"
    verbose_name_plural = "Buyurtma tarkibi"

    def has_add_permission(self, request, obj=None):
        return False

    @admin.display(description="Jami")
    def line_total(self, obj):
        if not obj or not obj.pk:
            return "—"
        if obj.price is None:
            return "—"
        total = obj.quantity * obj.price
        return format_html(
            '<strong style="color:#ffffff;">{} so\'m</strong>',
            f"{total:,.0f}",
        )


class CancelOrderForm(forms.Form):
    reason = forms.CharField(
        label="Bekor qilish sababi",
        widget=forms.Textarea(attrs={
            'rows': 4,
            'style': 'width:100%;max-width:640px;border-radius:10px;border:1.5px solid #2a2a2a;'
                     'padding:12px 16px;font-family:Inter,sans-serif;font-size:14px;'
                     'background:#1a1a1a;color:#ffffff;transition:border-color 200ms;',
            'placeholder': 'Sabab yozing...',
        }),
        error_messages={'required': "Bekor qilish sababini yozish shart."},
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'customer_name', 'customer_phone',
        'products_summary', 'formatted_total', 'colored_status',
        'order_buttons', 'formatted_date',
    )
    list_display_links = ('order_number', 'customer_name')
    list_filter = ('status', 'created_at')
    list_per_page = 25
    search_fields = ('customer_name', 'customer_phone', 'customer__username')
    date_hierarchy = 'created_at'
    fieldsets = (
        ("Mijoz ma'lumotlari", {
            'fields': ('customer', 'customer_name', 'customer_phone'),
        }),
        ("Buyurtma tafsilotlari", {
            'fields': ('total_price', 'promo_code_used'),
        }),
        ("Holati", {
            'fields': ('status', 'cancellation_reason'),
            'description': "Tasdiqlash yoki bekor qilish uchun holatni o'zgartiring.",
        }),
        ("Vaqt", {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    inlines = [OrderItemInline]
    readonly_fields = (
        'customer', 'customer_name', 'customer_phone',
        'total_price', 'promo_code_used', 'created_at', 'updated_at',
    )
    actions = ('mark_approved', 'mark_delivering', 'mark_completed')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:order_id>/approve/',
                self.admin_site.admin_view(self.approve_order),
                name='store_order_approve',
            ),
            path(
                '<int:order_id>/cancel/',
                self.admin_site.admin_view(self.cancel_order),
                name='store_order_cancel',
            ),
        ]
        return custom_urls + urls

    @admin.display(description="Buyurtma")
    def order_number(self, obj):
        return format_html(
            '<span style="font-weight:700;color:#ff6a00;">#{}</span>',
            obj.id,
        )

    @admin.display(description="Mahsulotlar")
    def products_summary(self, obj):
        items = obj.items.select_related('product').all()
        if not items.exists():
            return mark_safe('<span style="color:#666;">—</span>')
        text = ", ".join(f"{item.quantity}× {item.product.name}" for item in items)
        return Truncator(text).chars(80)

    @admin.display(description="Summa")
    def formatted_total(self, obj):
        if obj.total_price is None:
            return mark_safe('<span style="color:#666;">—</span>')
        return format_html(
            '<strong style="color:#ffffff;white-space:nowrap;">{} so\'m</strong>',
            f"{obj.total_price:,.0f}",
        )

    @admin.display(description="Holati", ordering="status")
    def colored_status(self, obj):
        color_map = {
            Order.STATUS_ACCEPTED:  ("#ffb347", "rgba(255,179,71,0.15)",  "⏳"),
            Order.STATUS_APPROVED:  ("#22c55e", "rgba(34,197,94,0.15)",   "✅"),
            Order.STATUS_DELIVERING:("#3b82f6", "rgba(59,130,246,0.15)",  "🚗"),
            Order.STATUS_COMPLETED: ("#8b5cf6", "rgba(139,92,246,0.15)",  "🎉"),
            Order.STATUS_CANCELLED: ("#ef4444", "rgba(239,68,68,0.15)",   "❌"),
        }
        color, bg, icon = color_map.get(obj.status, ("#a0a0a0", "rgba(160,160,160,0.15)", ""))
        return format_html(
            '<span style="display:inline-flex;align-items:center;gap:4px;'
            'background:{};color:{};padding:4px 12px;border-radius:20px;'
            'font-weight:600;font-size:12px;white-space:nowrap;">'
            '{} {}</span>',
            bg, color, icon, obj.get_status_display(),
        )

    @admin.display(description="Sana", ordering="created_at")
    def formatted_date(self, obj):
        return format_html(
            '<span style="color:#a0a0a0;font-size:13px;white-space:nowrap;">{}</span>',
            obj.created_at.strftime("%d.%m.%Y %H:%M"),
        )

    @admin.display(description="Amallar")
    def order_buttons(self, obj):
        if obj.status == Order.STATUS_CANCELLED:
            return mark_safe(
                '<span style="color:#ef4444;font-weight:600;font-size:12px;">❌ Bekor qilingan</span>'
            )
        if obj.status == Order.STATUS_COMPLETED:
            return mark_safe(
                '<span style="color:#22c55e;font-weight:600;font-size:12px;">🎉 Yakunlangan</span>'
            )

        approve_url = reverse('admin:store_order_approve', args=[obj.pk])
        cancel_url = reverse('admin:store_order_cancel', args=[obj.pk])
        return format_html(
            '<div style="display:flex;gap:6px;">'
            '<a class="pm-btn pm-btn-success" href="{}">✓ Tasdiqlash</a>'
            '<a class="pm-btn pm-btn-danger" href="{}">✕ Bekor</a>'
            '</div>',
            approve_url, cancel_url,
        )

    def approve_order(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id)
        if order.status not in (Order.STATUS_CANCELLED, Order.STATUS_COMPLETED):
            order.status = Order.STATUS_APPROVED
            order.cancellation_reason = ''
            # Bypass full_clean validation for admin actions
            Order.objects.filter(pk=order.pk).update(
                status=Order.STATUS_APPROVED,
                cancellation_reason='',
            )
            self.message_user(request, f"Buyurtma #{order.id} tasdiqlandi ✅", messages.SUCCESS)
        return redirect('admin:store_order_changelist')

    def cancel_order(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id)
        if request.method == 'POST':
            form = CancelOrderForm(request.POST)
            if form.is_valid():
                reason = form.cleaned_data['reason']
                # Use queryset update to bypass full_clean which requires reason before save
                Order.objects.filter(pk=order.pk).update(
                    status=Order.STATUS_CANCELLED,
                    cancellation_reason=reason,
                )
                self.message_user(request, f"Buyurtma #{order.id} bekor qilindi.", messages.SUCCESS)
                return redirect('admin:store_order_changelist')
        else:
            form = CancelOrderForm()

        context = {
            **self.admin_site.each_context(request),
            'title': f"Buyurtma #{order.id} — bekor qilish",
            'order': order,
            'form': form,
            'opts': self.model._meta,
        }
        return TemplateResponse(request, 'admin/store/order/cancel_order.html', context)

    @admin.action(description="✅ Tanlangan buyurtmalarni tasdiqlash")
    def mark_approved(self, request, queryset):
        updated = queryset.exclude(status=Order.STATUS_CANCELLED).update(
            status=Order.STATUS_APPROVED
        )
        self.message_user(request, f"{updated} ta buyurtma tasdiqlandi.", messages.SUCCESS)

    @admin.action(description="🚗 Tanlangan buyurtmalarni yetkazishga o'tkazish")
    def mark_delivering(self, request, queryset):
        updated = queryset.exclude(status=Order.STATUS_CANCELLED).update(
            status=Order.STATUS_DELIVERING
        )
        self.message_user(request, f"{updated} ta buyurtma yetkazishga o'tkazildi.", messages.SUCCESS)

    @admin.action(description="🎉 Tanlangan buyurtmalarni yakunlash")
    def mark_completed(self, request, queryset):
        updated = queryset.exclude(status=Order.STATUS_CANCELLED).update(
            status=Order.STATUS_COMPLETED
        )
        self.message_user(request, f"{updated} ta buyurtma yakunlandi.", messages.SUCCESS)
