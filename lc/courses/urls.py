from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet)
router.register(r'lessons', views.LessonViewSet)

urlpatterns = router.urls
