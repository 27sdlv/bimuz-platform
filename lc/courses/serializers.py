from django.db.models import Q
from rest_framework import serializers

from courses.lesson_utils import get_lesson_position
from courses.models import Course, Lesson
from homework.models import Homework
from progress.models import Enrollment, LessonWatchProgress, UserProgress


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
        if not obj.video_file:
            return None
        url = obj.video_file.url
        if url.startswith(('http://', 'https://')):
            return url
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(url)
        return url

    def get_video_source(self, obj):
        file_url = self.get_video_file_url(obj)
        if file_url:
            return file_url
        return obj.video_url or None

    def get_is_locked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return True
        if request.user.is_admin():
            return False

        lesson_position = get_lesson_position(obj)
        if lesson_position == 1:
            return False

        if not Enrollment.objects.filter(student=request.user, course=obj.course, is_active=True).exists():
            return True

        progress, _ = UserProgress.objects.get_or_create(student=request.user, course=obj.course)
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
        next_lesson = Lesson.objects.filter(course=obj.course).filter(
            Q(order__gt=obj.order) | Q(order=obj.order, id__gt=obj.id)
        ).order_by('order', 'id').first()
        return next_lesson.id if next_lesson else None


class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    enrolled_count = serializers.IntegerField(read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'thumbnail',
            'price',
            'price_formatted',
            'teacher',
            'lessons',
            'enrolled_count',
            'is_enrolled',
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if request.user.is_admin():
            return True
        return Enrollment.objects.filter(student=request.user, course=obj, is_active=True).exists()
