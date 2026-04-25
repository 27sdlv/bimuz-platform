from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from . import views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet)
router.register(r'lessons', views.LessonViewSet)
router.register(r'homework', views.HomeworkViewSet)
router.register(r'groups', views.StudyGroupViewSet)
router.register(r'admin/users', views.AdminUserViewSet)
router.register(r'admin/enrollments', views.EnrollmentAdminViewSet)
router.register(r'admin/progress', views.UserProgressAdminViewSet)
router.register(r'admin/watches', views.LessonWatchProgressAdminViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.UserRegistrationView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', views.CurrentUserView.as_view(), name='current_user'),
]
