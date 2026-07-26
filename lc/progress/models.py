from django.conf import settings
from django.db import models


class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'lc_enrollment'
        unique_together = ['student', 'course']

    def __str__(self):
        return f'{self.student.username} -> {self.course.title}'


class UserProgress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    last_unlocked_order = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'lc_userprogress'
        unique_together = ['student', 'course']


class LessonWatchProgress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_watches')
    lesson = models.ForeignKey('courses.Lesson', on_delete=models.CASCADE, related_name='watch_progresses')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'lc_lessonwatchprogress'
        unique_together = ['student', 'lesson']
