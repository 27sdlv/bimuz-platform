from django.contrib import admin

from .models import Enrollment, LessonWatchProgress, UserProgress


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'is_active']


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'last_unlocked_order']


@admin.register(LessonWatchProgress)
class LessonWatchProgressAdmin(admin.ModelAdmin):
    list_display = ['student', 'lesson', 'is_completed', 'completed_at']
    list_filter = ['is_completed', 'lesson__course']
    search_fields = ['student__username', 'lesson__title']
