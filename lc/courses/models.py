from django.conf import settings
from django.db import models


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', blank=True, null=True)
    price = models.DecimalField(max_digits=12, decimal_places=0)
    price_formatted = models.CharField(max_length=50, blank=True)

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='courses_taught',
        limit_choices_to={'role': 'teacher'},
    )
    max_students = models.IntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lc_course'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    video_url = models.URLField(blank=True, null=True, help_text='External video URL (optional)')
    video_file = models.FileField(upload_to='lessons/videos/', blank=True, null=True)
    homework_task = models.TextField(blank=True, null=True, help_text='Instructions for the homework')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'lc_lesson'
        ordering = ['order']

    def save(self, *args, **kwargs):
        if not self.id and (self.order == 0 or self.order is None):
            last_lesson = Lesson.objects.filter(course=self.course).order_by('-order').first()
            self.order = (last_lesson.order + 1) if last_lesson else 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.course.title} - {self.order}: {self.title}'
