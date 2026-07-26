from django.conf import settings
from django.db import models


class StudyGroup(models.Model):
    STATUS_CHOICES = (
        ('active', 'Faol'),
        ('inactive', 'Nofaol'),
    )

    name = models.CharField(max_length=100, unique=True)
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mentored_groups',
        limit_choices_to={'role__in': ['teacher', 'admin']},
    )
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='groups',
    )
    days = models.CharField(max_length=100, help_text='Masalan: Dushanba - Chorshanba - Juma')
    time = models.TimeField()
    start_date = models.DateField()
    end_date = models.DateField()
    max_students = models.PositiveIntegerField(default=10)
    current_students = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=12, decimal_places=0)
    lessons_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lc_studygroup'
        ordering = ['-start_date', 'name']

    def __str__(self):
        return self.name
