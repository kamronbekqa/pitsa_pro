from django import template
from django.utils import timezone
from django.db.models import Sum

register = template.Library()


@register.simple_tag
def get_dashboard_stats():
    """Return all dashboard statistics for the admin index page."""
    from store.models import Order, Product, PromoCode
    from contact.models import Message
    from django.contrib.auth import get_user_model

    User = get_user_model()
    today = timezone.now().date()

    revenue = (
        Order.objects.filter(status__in=["approved", "delivering", "completed"])
        .aggregate(total=Sum("total_price"))["total"]
        or 0
    )

    return {
        "total_orders": Order.objects.count(),
        "today_orders": Order.objects.filter(created_at__date=today).count(),
        "revenue": revenue,
        "active_products": Product.objects.filter(is_active=True).count(),
        "active_promos": PromoCode.objects.filter(is_active=True).count(),
        "new_messages": Message.objects.count(),
        "pending_orders": Order.objects.filter(status="accepted").count(),
        "total_customers": User.objects.filter(is_staff=False).count(),
    }


@register.simple_tag
def get_recent_orders():
    """Return the 5 most recent orders for the dashboard."""
    from store.models import Order

    return Order.objects.select_related("customer").order_by("-created_at")[:5]
