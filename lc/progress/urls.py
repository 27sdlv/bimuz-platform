from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'admin/enrollments', views.EnrollmentAdminViewSet)
router.register(r'admin/progress', views.UserProgressAdminViewSet)
router.register(r'admin/watches', views.LessonWatchProgressAdminViewSet)

urlpatterns = router.urls
