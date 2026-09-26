from django.core.management.base import BaseCommand

from store.models import ClothingItem


SAMPLE_CLOTHES = [
    {"name": "Everyday Cotton Tee", "category": "Tops", "price": "799.00", "size": "S–XL", "color": "Cloud white", "stock": 24, "description": "A soft, breathable cotton tee with an easy relaxed fit."},
    {"name": "Ribbed Tank Top", "category": "Tops", "price": "649.00", "size": "XS–L", "color": "Sage", "stock": 17, "description": "A stretchy rib-knit layer for warm days and easy layering."},
    {"name": "Linen Button Shirt", "category": "Tops", "price": "1899.00", "size": "S–XXL", "color": "Natural flax", "stock": 12, "description": "Lightweight linen with a classic collar and relaxed shape."},
    {"name": "Relaxed Oxford Shirt", "category": "Tops", "price": "1599.00", "size": "S–XL", "color": "Sky blue", "stock": 8, "description": "A crisp cotton Oxford made for everyday wear."},
    {"name": "Everyday Straight Jeans", "category": "Bottoms", "price": "2299.00", "size": "28–36", "color": "Indigo", "stock": 10, "description": "Mid-rise straight-leg denim with a comfortable broken-in feel."},
    {"name": "Pleated Wide-Leg Trousers", "category": "Bottoms", "price": "1999.00", "size": "XS–XL", "color": "Charcoal", "stock": 9, "description": "Tailored pleats meet a fluid, easy-to-style leg."},
    {"name": "Utility Chino", "category": "Bottoms", "price": "1799.00", "size": "28–36", "color": "Olive", "stock": 14, "description": "A durable cotton chino with practical pockets and a clean finish."},
    {"name": "Everyday Midi Dress", "category": "Dresses", "price": "2499.00", "size": "XS–XL", "color": "Terracotta", "stock": 7, "description": "An easy midi silhouette with soft gathers and pockets."},
    {"name": "Floral Wrap Dress", "category": "Dresses", "price": "2799.00", "size": "XS–XL", "color": "Indigo floral", "stock": 5, "description": "A lightweight wrap dress with an adjustable waist tie."},
    {"name": "Soft Knit Cardigan", "category": "Layers", "price": "2199.00", "size": "S–XL", "color": "Oatmeal", "stock": 11, "description": "A cozy cotton-blend cardigan for cool mornings and late evenings."},
    {"name": "Canvas Weekend Tote", "category": "Accessories", "price": "899.00", "size": "One size", "color": "Natural / forest", "stock": 22, "description": "A sturdy canvas carryall for market trips and everyday errands."},
    {"name": "Ribbed Beanie", "category": "Accessories", "price": "599.00", "size": "One size", "color": "Rust", "stock": 0, "description": "A soft rib-knit beanie, currently sold out in this color."},
]


class Command(BaseCommand):
    help = "Add or refresh the sample clothing catalog entries."

    def handle(self, *args, **options):
        for item in SAMPLE_CLOTHES:
            ClothingItem.objects.update_or_create(name=item["name"], defaults=item)
        self.stdout.write(self.style.SUCCESS(f"Catalog ready: {len(SAMPLE_CLOTHES)} sample clothing items."))
