











from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Q
from .models import CustomUser, Course, Lesson, Homework, Enrollment, UserProgress, StudyGroup, LessonWatchProgress


def get_lesson_position(lesson):
    return Lesson.objects.filter(course=lesson.course).filter(
        Q(order__lt=lesson.order) | Q(order=lesson.order, id__lte=lesson.id)
    ).count()

class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField()
    is_superuser = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'phone', 'full_name', 'is_admin', 'is_superuser', 'is_staff']

    def get_is_admin(self, obj):
        return obj.is_admin()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'phone', 'password', 'full_name']
        
    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            full_name=validated_data.get('full_name', ''),
            phone=validated_data.get('phone', ''),
            password=validated_data['password'],
            role='student' # Default role for sign-ups
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    identifier = serializers.CharField(required=False, write_only=True)

    def validate(self, attrs):
        attrs = attrs.copy()

        identifier = attrs.get('identifier')
        username_field = self.username_field
        username_value = attrs.get(username_field)

        if isinstance(identifier, str) and identifier.strip() and not username_value:
            attrs[username_field] = identifier.strip()
        elif isinstance(username_value, str):
            attrs[username_field] = username_value.strip()

        return super().validate(attrs)

class LessonSerializer(serializers.ModelSerializer):
    is_locked = serializers.SerializerMethodField()
    has_submission = serializers.SerializerMethodField()
    submission_status = serializers.SerializerMethodField()
    video_file_url = serializers.SerializerMethodField()
    video_source = serializers.SerializerMethodField()
    watched_completed = serializers.SerializerMethodField()
    next_lesson_id = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id',
            'course',
            'title',
            'description',
            'video_url',
            'video_file',
            'video_file_url',
            'video_source',
            'watched_completed',
            'homework_task',
            'order',
            'is_locked',
            'has_submission',
            'submission_status',
            'next_lesson_id',
        ]

    def get_video_file_url(self, obj):
        request = self.context.get('request')
        if obj.video_file:
            if request is not None:
                return request.build_absolute_uri(obj.video_file.url)
            return obj.video_file.url
        return None

    def get_video_source(self, obj):
        file_url = self.get_video_file_url(obj)
        if file_url:
            return file_url
        return obj.video_url or None

    def get_is_locked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return True
        # Admins see everything
        if request.user.is_admin():
            return False

        # First lesson of EVERY course is always available as a preview
        lesson_position = get_lesson_position(obj)
        if lesson_position == 1:
            return False

        if not Enrollment.objects.filter(student=request.user, course=obj.course, is_active=True).exists():
            return True

        progress, created = UserProgress.objects.get_or_create(student=request.user, course=obj.course)
        return lesson_position > progress.last_unlocked_order

    def get_has_submission(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Homework.objects.filter(student=request.user, lesson=obj).exists()

    def get_submission_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        homework = Homework.objects.filter(student=request.user, lesson=obj).first()
        return homework.status if homework else None

    def get_watched_completed(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return LessonWatchProgress.objects.filter(
            student=request.user,
            lesson=obj,
            is_completed=True,
        ).exists()

    def get_next_lesson_id(self, obj):
        next_lesson = Lesson.objects.filter(
            course=obj.course
        ).filter(
            Q(order__gt=obj.order) | Q(order=obj.order, id__gt=obj.id)
        ).order_by('order', 'id').first()
        return next_lesson.id if next_lesson else None

class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    enrolled_count = serializers.IntegerField(source='count_enrolled', read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'price', 'price_formatted', 'teacher', 'lessons', 'enrolled_count', 'is_enrolled']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if request.user.is_admin():
            return True
        return Enrollment.objects.filter(student=request.user, course=obj, is_active=True).exists()

class HomeworkSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = Homework
        fields = ['id', 'student', 'student_name', 'lesson', 'lesson_title', 'file', 'comment', 'status', 'feedback', 'submitted_at']
        read_only_fields = ['student', 'status', 'feedback']

class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'full_name',
            'phone',
            'role',
            'is_active',
            'is_staff',
            'is_superuser',
            'password',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_name', 'course', 'course_title', 'enrolled_at', 'is_active']


class UserProgressSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = UserProgress
        fields = ['id', 'student', 'student_name', 'course', 'course_title', 'last_unlocked_order']


class LessonWatchProgressSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    course_title = serializers.CharField(source='lesson.course.title', read_only=True)

    class Meta:
        model = LessonWatchProgress
        fields = ['id', 'student', 'student_name', 'lesson', 'lesson_title', 'course_title', 'is_completed', 'completed_at']


class StudyGroupSerializer(serializers.ModelSerializer):
    specialization_name = serializers.CharField(source='course.title', read_only=True)
    mentor_name = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = StudyGroup
        fields = [
            'id',
            'name',
            'specialization_name',
            'mentor',
            'mentor_name',
            'course',
            'course_title',
            'days',
            'time',
            'start_date',
            'end_date',
            'current_students',
            'max_students',
            'available_seats',
            'price',
            'lessons_count',
            'status',
            'status_label',
            'created_at',
        ]

    def get_mentor_name(self, obj):
        if not obj.mentor:
            return None
        return obj.mentor.full_name or obj.mentor.username

    def get_available_seats(self, obj):
        return max(obj.max_students - obj.current_students, 0)
