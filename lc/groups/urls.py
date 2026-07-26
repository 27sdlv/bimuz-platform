from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'groups', views.StudyGroupViewSet)

urlpatterns = router.urls
