from rest_framework import viewsets

from accounts.permissions import IsAdminRole
from .models import Enrollment, LessonWatchProgress, UserProgress
from .serializers import EnrollmentSerializer, LessonWatchProgressSerializer, UserProgressSerializer


class EnrollmentAdminViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.select_related('student', 'course').all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAdminRole]


class UserProgressAdminViewSet(viewsets.ModelViewSet):
    queryset = UserProgress.objects.select_related('student', 'course').all()
    serializer_class = UserProgressSerializer
    permission_classes = [IsAdminRole]


class LessonWatchProgressAdminViewSet(viewsets.ModelViewSet):
    queryset = LessonWatchProgress.objects.select_related('student', 'lesson', 'lesson__course').all()
    serializer_class = LessonWatchProgressSerializer
    permission_classes = [IsAdminRole]
