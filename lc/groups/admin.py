from django.contrib import admin

from .models import StudyGroup


@admin.register(StudyGroup)
class StudyGroupAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'course',
        'mentor',
        'days',
        'time',
        'start_date',
        'end_date',
        'current_students',
        'max_students',
        'price',
        'lessons_count',
        'status',
    ]
    list_filter = ['status', 'course', 'mentor']
    search_fields = ['name', 'course__title', 'mentor__username', 'mentor__full_name']
