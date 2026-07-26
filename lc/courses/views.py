from django.db.models import Count, Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdminRole
from courses.models import Course, Lesson
from courses.serializers import CourseSerializer, LessonSerializer
from progress.models import Enrollment, LessonWatchProgress, UserProgress
from progress.services import is_lesson_unlocked, try_unlock_next_lesson


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Course.objects.annotate(
            enrolled_count=Count('enrollments', filter=Q(enrollments__is_active=True))
        )

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        if self.action in ['enroll', 'enrolled']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
            defaults={'is_active': True},
        )
        if not created and not enrollment.is_active:
            enrollment.is_active = True
            enrollment.save(update_fields=['is_active'])
        UserProgress.objects.get_or_create(student=request.user, course=course)
        return Response({'status': 'enrolled'}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def enrolled(self, request):
        queryset = self.get_queryset().filter(
            enrollments__student=request.user,
            enrollments__is_active=True,
        ).distinct()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        queryset = Lesson.objects.all()

        if not self.request.user.is_admin():
            enrolled_course_ids = Enrollment.objects.filter(
                student=self.request.user,
                is_active=True,
            ).values_list('course_id', flat=True)
            queryset = queryset.filter(course_id__in=enrolled_course_ids)

        if self.action == 'list':
            if course_id:
                return queryset.filter(course_id=course_id)
            return Lesson.objects.none()

        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete(self, request, pk=None):
        from django.utils import timezone

        lesson = self.get_object()
        if not is_lesson_unlocked(request.user, lesson):
            return Response({'detail': 'Bu dars hali yopiq'}, status=status.HTTP_403_FORBIDDEN)

        watch_progress, _ = LessonWatchProgress.objects.get_or_create(student=request.user, lesson=lesson)
        if not watch_progress.is_completed:
            watch_progress.is_completed = True
            watch_progress.completed_at = timezone.now()
            watch_progress.save(update_fields=['is_completed', 'completed_at'])

        unlocked = try_unlock_next_lesson(request.user, lesson)
        return Response({'status': 'completed', 'unlocked_next': unlocked})
