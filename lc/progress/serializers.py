from rest_framework import serializers

from .models import Enrollment, LessonWatchProgress, UserProgress


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
        fields = [
            'id',
            'student',
            'student_name',
            'lesson',
            'lesson_title',
            'course_title',
            'is_completed',
            'completed_at',
        ]
