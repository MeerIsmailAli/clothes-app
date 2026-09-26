from rest_framework.routers import DefaultRouter
from django.urls import include, path

from .views import ClothingItemViewSet, health

router = DefaultRouter()
router.register("clothes", ClothingItemViewSet, basename="clothing")

urlpatterns = [path("health/", health, name="health"), path("", include(router.urls))]
