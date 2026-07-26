from django.contrib import admin

from .models import Homework


@admin.register(Homework)
class HomeworkAdmin(admin.ModelAdmin):
    list_display = ['student', 'lesson', 'status', 'submitted_at']
    list_filter = ['status', 'lesson__course']
    readonly_fields = ['submitted_at', 'updated_at']
    search_fields = ['student__username', 'lesson__title']

    actions = ['approve_homework', 'reject_homework']

    def approve_homework(self, request, queryset):
        queryset.update(status='approved')

    approve_homework.short_description = 'Tanlangan topshiriqlarni qabul qilish'

    def reject_homework(self, request, queryset):
        queryset.update(status='rejected')

    reject_homework.short_description = 'Tanlangan topshiriqlarni rad etish'
