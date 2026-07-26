from django.conf import settings
from django.db import models


class Homework(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Kutilmoqda'),
        ('approved', 'Qabul qilindi'),
        ('rejected', 'Rad etildi'),
    )

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='homeworks')
    lesson = models.ForeignKey('courses.Lesson', on_delete=models.CASCADE, related_name='submissions')
    file = models.FileField(upload_to='homeworks/')
    comment = models.TextField(blank=True, help_text="Student's notes")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    feedback = models.TextField(blank=True, help_text='Admin/Teacher review')
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lc_homework'
        unique_together = ['student', 'lesson']

    def __str__(self):
        return f'{self.student.username} - {self.lesson.title} ({self.status})'
