from django.contrib import admin
from .models import ClothingItem


@admin.register(ClothingItem)
class ClothingItemAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "updated_at")
    list_filter = ("category", "size", "color")
    search_fields = ("name", "description", "category")
