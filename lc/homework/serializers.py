from rest_framework import serializers

from .models import Homework


class HomeworkSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = Homework
        fields = [
            'id',
            'student',
            'student_name',
            'lesson',
            'lesson_title',
            'file',
            'comment',
            'status',
            'feedback',
            'submitted_at',
        ]
        read_only_fields = ['student', 'status', 'feedback']
