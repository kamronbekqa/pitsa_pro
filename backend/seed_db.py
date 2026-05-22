import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Product, PromoCode

def seed():
    # Clear existing data
    Product.objects.all().delete()
    PromoCode.objects.all().delete()

    # Add Products
    pizzas = [
        {"name": "Margherita Klassik", "description": "Haqiqiy italyan pomidorlari, yangi Mozzarella pishlog'i va rayhon barglari.", "price": 55000, "is_featured": True},
        {"name": "Double Pepperoni", "description": "Ikki barobar ko'proq achchiq pepperoni kolbasalari va erigan pishloq.", "price": 75000, "is_featured": True},
        {"name": "PitsaMaster Maxsus", "description": "Tovuq go'shti, qo'ziqorin, qizil piyoz va maxsus oq sous bilan.", "price": 85000, "is_featured": True},
        {"name": "Quattro Formaggi", "description": "To'rt xil pishloq: Mozzarella, Parmesan, Gorgonzola va Chedder.", "price": 80000},
        {"name": "Go'shtli Miks", "description": "Mol go'shti, pepperoni, kurka go'shti va duduqlangan kolbasalar.", "price": 95000},
        {"name": "BBQ Tovuq", "description": "Grilda pishgan tovuq bo'laklari, makkajo'xori va xushbo'y BBQ sousi.", "price": 72000},
        {"name": "Vegetarian", "description": "Barra bolgar qalampiri, pomidor, qora zaytun va makkajo'xori.", "price": 60000},
        {"name": "Meksikancha", "description": "Achchiq xalapeno qalampiri, mol go'shti va qizil piyoz.", "price": 68000},
        {"name": "Dengiz Mahsulotlari", "description": "Krevetkalar, kalmarlar va maxsus krem-sous bilan.", "price": 110000},
        {"name": "Gavayya", "description": "Ananas, kurka go'shti va shirin-achchiq sous uyg'unligi.", "price": 70000},
    ]

    for p in pizzas:
        Product.objects.create(**p)
    
    # Add Promo Code
    PromoCode.objects.create(code="FREEPIZZA", discount_percent=15)
    PromoCode.objects.create(code="YANGI2025", discount_percent=20)

    print("Bazaga ma'lumotlar muvaffaqiyatli qo'shildi!")

if __name__ == "__main__":
    seed()
