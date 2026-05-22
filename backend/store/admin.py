from django import forms
from django.contrib import admin, messages
from django.shortcuts import get_object_or_404, redirect
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils.text import Truncator
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import Product, PromoCode, Order, OrderItem

admin.site.site_header = "PitsaMaster Admin Panel"
admin.site.site_title = "PitsaMaster Admin"
admin.site.index_title = "Buyurtmalar, menyu kartalari va chegirmalarni boshqarish"

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'name', 'short_description', 'price', 'is_active', 'is_featured')
    list_display_links = ('image_preview', 'name')
    list_editable = ('is_active', 'is_featured')
    list_filter = ('is_active', 'is_featured')
    search_fields = ('name', 'description')
    readonly_fields = ('card_preview',)
    fieldsets = (
        ("Admin ko'rib turgan card", {
            'fields': ('card_preview',),
            'description': "Shu preview qaysi menyu cardini o'zgartirayotganingizni ko'rsatadi.",
        }),
        ("Menyu card ma'lumotlari", {
            'fields': ('name', 'description', 'price', 'image', 'is_active', 'is_featured'),
        }),
    )

    @admin.display(description="Rasm")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:54px;height:54px;object-fit:cover;border-radius:8px;" />', obj.image.url)
        return "Rasm yo'q"

    @admin.display(description="Tarkibi")
    def short_description(self, obj):
        return Truncator(obj.description).chars(70)

    @admin.display(description="Card preview")
    def card_preview(self, obj):
        if obj and obj.image:
            image_html = format_html(
                '<img src="{}" style="width:120px;height:90px;object-fit:cover;border-radius:8px;margin-right:16px;" />',
                obj.image.url,
            )
        else:
            image_html = mark_safe(
                '<div style="width:120px;height:90px;border-radius:8px;margin-right:16px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#6b7280;">Rasm yo&apos;q</div>'
            )
        name = obj.name if obj and obj.pk else "Yangi pitsa card"
        description = obj.description if obj and obj.pk else "Tarkib yozilmagan"
        price = obj.price if obj and obj.pk else "-"
        return format_html(
            '<div style="display:flex;align-items:center;max-width:620px;padding:14px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">{}'
            '<div><strong style="font-size:18px;color:#111827;">{}</strong>'
            '<p style="margin:8px 0;color:#4b5563;">{}</p>'
            '<strong style="color:#ea580c;">{} so&apos;m</strong></div></div>',
            image_html,
            name,
            Truncator(description).chars(120),
            price,
        )

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percent', 'is_active')
    list_editable = ('is_active',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price', 'line_total')
    fields = ('product', 'quantity', 'price', 'line_total')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False

    @admin.display(description="Jami")
    def line_total(self, obj):
        if not obj or not obj.pk:
            return "-"
        return f"{obj.quantity * obj.price} so'm"

class CancelOrderForm(forms.Form):
    reason = forms.CharField(
        label="Bekor qilish sababi",
        widget=forms.Textarea(attrs={'rows': 5, 'style': 'width:100%; max-width:720px;'}),
        error_messages={'required': "Bekor qilish sababini yozish shart."},
    )

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_account', 'customer_name', 'customer_phone', 'products_summary', 'total_price', 'colored_status', 'order_buttons', 'created_at')
    list_display_links = ('order_number', 'customer_name')
    list_filter = ('status', 'created_at', 'customer')
    list_per_page = 25
    search_fields = ('customer_name', 'customer_phone', 'customer__username')
    fieldsets = (
        ("Mijoz va buyurtma", {
            'fields': ('customer', 'customer_name', 'customer_phone', 'total_price', 'promo_code_used'),
        }),
        ("Tasdiqlash yoki bekor qilish", {
            'fields': ('status', 'cancellation_reason'),
            'description': "Tasdiqlash uchun statusni 'Buyurtma tasdiqlandi' qiling. Bekor qilish uchun statusni 'Buyurtma bekor qilindi' qiling va sababini yozing.",
        }),
        ("Vaqt", {
            'fields': ('created_at', 'updated_at'),
        }),
    )
    inlines = [OrderItemInline]
    readonly_fields = ('customer', 'customer_name', 'customer_phone', 'total_price', 'promo_code_used', 'created_at', 'updated_at')
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
        return f"#{obj.id}"

    @admin.display(description="User")
    def customer_account(self, obj):
        return obj.customer.username if obj.customer else "Login qilmagan"

    @admin.display(description="Buyurtma ichidagi pitsalar")
    def products_summary(self, obj):
        items = obj.items.select_related('product').all()
        if not items:
            return "Mahsulot yo'q"
        text = ", ".join(f"{item.quantity}x {item.product.name}" for item in items)
        return Truncator(text).chars(90)

    @admin.display(description="Holati")
    def colored_status(self, obj):
        colors = {
            Order.STATUS_ACCEPTED: "#f59e0b",
            Order.STATUS_APPROVED: "#22c55e",
            Order.STATUS_DELIVERING: "#38bdf8",
            Order.STATUS_COMPLETED: "#a78bfa",
            Order.STATUS_CANCELLED: "#ef4444",
        }
        return format_html(
            '<strong style="color:{}">{}</strong>',
            colors.get(obj.status, "#fff"),
            obj.get_status_display(),
        )

    @admin.display(description="Admin nima qiladi?")
    def admin_next_step(self, obj):
        if obj.status == Order.STATUS_ACCEPTED:
            return "Ochib tasdiqlang yoki bekor sababini yozing"
        if obj.status == Order.STATUS_APPROVED:
            return "Yetkazishga o'tkazing"
        if obj.status == Order.STATUS_DELIVERING:
            return "Yakunlang"
        if obj.status == Order.STATUS_CANCELLED:
            return f"Bekor sabab: {Truncator(obj.cancellation_reason).chars(45)}"
        return "Tayyor"

    @admin.display(description="Tasdiqlash / bekor qilish")
    def order_buttons(self, obj):
        if obj.status == Order.STATUS_CANCELLED:
            return format_html(
                '<span style="color:#ef4444;font-weight:700;">Bekor qilingan</span>'
            )
        if obj.status == Order.STATUS_COMPLETED:
            return format_html(
                '<span style="color:#22c55e;font-weight:700;">Yakunlangan</span>'
            )

        approve_url = reverse('admin:store_order_approve', args=[obj.pk])
        cancel_url = reverse('admin:store_order_cancel', args=[obj.pk])
        return format_html(
            '<a class="admin-order-btn admin-order-approve" href="{}">Tasdiqlash</a>'
            '<a class="admin-order-btn admin-order-cancel" href="{}">Bekor qilish</a>',
            approve_url,
            cancel_url,
        )

    def approve_order(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id)
        if order.status != Order.STATUS_CANCELLED:
            order.status = Order.STATUS_APPROVED
            order.cancellation_reason = ''
            order.save()
            self.message_user(request, f"Buyurtma #{order.id} tasdiqlandi.", messages.SUCCESS)
        return redirect('admin:store_order_changelist')

    def cancel_order(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id)
        if request.method == 'POST':
            form = CancelOrderForm(request.POST)
            if form.is_valid():
                order.status = Order.STATUS_CANCELLED
                order.cancellation_reason = form.cleaned_data['reason']
                order.save()
                self.message_user(request, f"Buyurtma #{order.id} bekor qilindi.", messages.SUCCESS)
                return redirect('admin:store_order_changelist')
        else:
            form = CancelOrderForm()

        context = {
            **self.admin_site.each_context(request),
            'title': f"Buyurtma #{order.id} ni bekor qilish",
            'order': order,
            'form': form,
            'opts': self.model._meta,
        }
        return TemplateResponse(request, 'admin/store/order/cancel_order.html', context)

    @admin.action(description="Tanlangan buyurtmalarni tasdiqlash")
    def mark_approved(self, request, queryset):
        updated = 0
        for order in queryset.exclude(status=Order.STATUS_CANCELLED):
            order.status = Order.STATUS_APPROVED
            order.save()
            updated += 1
        self.message_user(request, f"{updated} ta buyurtma tasdiqlandi.", messages.SUCCESS)

    @admin.action(description="Tanlangan buyurtmalarni yetkazishga o'tkazish")
    def mark_delivering(self, request, queryset):
        updated = 0
        for order in queryset.exclude(status=Order.STATUS_CANCELLED):
            order.status = Order.STATUS_DELIVERING
            order.save()
            updated += 1
        self.message_user(request, f"{updated} ta buyurtma yetkazishga o'tkazildi.", messages.SUCCESS)

    @admin.action(description="Tanlangan buyurtmalarni yakunlash")
    def mark_completed(self, request, queryset):
        updated = 0
        for order in queryset.exclude(status=Order.STATUS_CANCELLED):
            order.status = Order.STATUS_COMPLETED
            order.save()
            updated += 1
        self.message_user(request, f"{updated} ta buyurtma yakunlandi.", messages.SUCCESS)
