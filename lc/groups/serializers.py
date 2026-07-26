from rest_framework import serializers

from .models import StudyGroup


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
