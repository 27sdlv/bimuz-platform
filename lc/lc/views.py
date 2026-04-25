from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Course, Lesson, Homework, Enrollment, UserProgress, StudyGroup, LessonWatchProgress
from .serializers import (
    CourseSerializer,
    LessonSerializer,
    HomeworkSerializer,
    UserSerializer,
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    StudyGroupSerializer,
    AdminUserSerializer,
    EnrollmentSerializer,
    UserProgressSerializer,
    LessonWatchProgressSerializer,
)
from .permissions import IsAdminRole


def get_lesson_position(lesson):
    return Lesson.objects.filter(course=lesson.course).filter(
        Q(order__lt=lesson.order) | Q(order=lesson.order, id__lte=lesson.id)
    ).count()


def is_lesson_unlocked(student, lesson):
    if student.is_admin():
        return True
    if not Enrollment.objects.filter(student=student, course=lesson.course, is_active=True).exists():
        return False
    progress, _ = UserProgress.objects.get_or_create(student=student, course=lesson.course)
    return get_lesson_position(lesson) <= progress.last_unlocked_order


def try_unlock_next_lesson(student, lesson):
    progress, _ = UserProgress.objects.get_or_create(student=student, course=lesson.course)
    lesson_position = get_lesson_position(lesson)
    if lesson_position != progress.last_unlocked_order:
        return False

    homework_ok = Homework.objects.filter(student=student, lesson=lesson, status='approved').exists()
    watched_ok = LessonWatchProgress.objects.filter(student=student, lesson=lesson, is_completed=True).exists()

    if homework_ok and watched_ok:
        progress.last_unlocked_order += 1
        progress.save(update_fields=['last_unlocked_order'])
        return True
    return False

# ============================================================
# ACCOUNT API
# ============================================================
class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# ============================================================
# COURSE API
# ============================================================
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]

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
        queryset = self.get_queryset().filter(enrollments__student=request.user, enrollments__is_active=True).distinct()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

# ============================================================
# LESSON API
# ============================================================
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

        # Keep list endpoint filterable by course, but allow retrieve by lesson id.
        if self.action == 'list':
            if course_id:
                return queryset.filter(course_id=course_id)
            return Lesson.objects.none()

        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete(self, request, pk=None):
        lesson = self.get_object()
        if not is_lesson_unlocked(request.user, lesson):
            return Response({'detail': "Bu dars hali yopiq"}, status=status.HTTP_403_FORBIDDEN)
        watch_progress, _ = LessonWatchProgress.objects.get_or_create(student=request.user, lesson=lesson)

        if not watch_progress.is_completed:
            watch_progress.is_completed = True
            watch_progress.completed_at = timezone.now()
            watch_progress.save(update_fields=['is_completed', 'completed_at'])

        unlocked = try_unlock_next_lesson(request.user, lesson)
        return Response({'status': 'completed', 'unlocked_next': unlocked})

# ============================================================
# HOMEWORK API (PROGRESS CONTROL)
# ============================================================
class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin():
            return Homework.objects.all()
        return Homework.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
 
    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def approve(self, request, pk=None):
        homework = self.get_object()
        homework.status = 'approved'
        homework.save()

        unlocked = try_unlock_next_lesson(homework.student, homework.lesson)
        return Response({'status': 'approved', 'unlocked_next': unlocked})
 
    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def reject(self, request, pk=None):
        homework = self.get_object()
        homework.status = 'rejected'
        homework.feedback = request.data.get('feedback', '')
        homework.save()
        return Response({'status': 'rejected'})


class StudyGroupViewSet(viewsets.ModelViewSet):
    queryset = StudyGroup.objects.select_related('mentor', 'course').all()
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get('course_id')
        status_param = self.request.query_params.get('status')

        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = get_user_model().objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]
 
 
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
