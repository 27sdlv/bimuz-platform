from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Course, Lesson, Homework, Enrollment, UserProgress, StudyGroup, LessonWatchProgress

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'phone', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('BIMUZ Info', {'fields': ('role', 'phone')}),
    )

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ('title', 'description', 'video_url', 'video_file', 'order')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'teacher', 'price_formatted']
    inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'video_url', 'video_file']
    list_filter = ['course']

@admin.register(Homework)
class HomeworkAdmin(admin.ModelAdmin):
    list_display = ['student', 'lesson', 'status', 'submitted_at']
    list_filter = ['status', 'lesson__course']
    readonly_fields = ['submitted_at', 'updated_at']
    search_fields = ['student__username', 'lesson__title']
    
    actions = ['approve_homework', 'reject_homework']

    def approve_homework(self, request, queryset):
        queryset.update(status='approved')
        # Logic to unlock next lesson could be added here or in save()
    approve_homework.short_description = "Tanlangan topshiriqlarni qabul qilish"

    def reject_homework(self, request, queryset):
        queryset.update(status='rejected')
    reject_homework.short_description = "Tanlangan topshiriqlarni rad etish"

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
