from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager


class CustomUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        return super().create_superuser(username, email=email, password=password, **extra_fields)


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    objects = CustomUserManager()

    def is_admin(self):
        return self.role == 'admin' or self.is_superuser

    def is_teacher(self):
        return self.role == 'teacher'

    def is_student(self):
        return self.role == 'student'


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', blank=True, null=True)
    price = models.DecimalField(max_digits=12, decimal_places=0) # So'm formatting
    price_formatted = models.CharField(max_length=50, blank=True) # e.g. "2,450,000 so'm"
    
    teacher = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='courses_taught',
        limit_choices_to={'role': 'teacher'}
    )
    max_students = models.IntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    video_url = models.URLField(blank=True, null=True, help_text="External video URL (optional)")
    video_file = models.FileField(upload_to='lessons/videos/', blank=True, null=True)
    homework_task = models.TextField(blank=True, null=True, help_text="Instructions for the homework")
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']

    def save(self, *args, **kwargs):
        if not self.id and (self.order == 0 or self.order is None):
            last_lesson = Lesson.objects.filter(course=self.course).order_by('-order').first()
            if last_lesson:
                self.order = last_lesson.order + 1
            else:
                self.order = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.course.title} - {self.order}: {self.title}"


class StudyGroup(models.Model):
    STATUS_CHOICES = (
        ('active', 'Faol'),
        ('inactive', 'Nofaol'),
    )

    name = models.CharField(max_length=100, unique=True)
    mentor = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mentored_groups',
        limit_choices_to={'role__in': ['teacher', 'admin']},
    )
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='groups')
    days = models.CharField(max_length=100, help_text="Masalan: Dushanba - Chorshanba - Juma")
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
        ordering = ['-start_date', 'name']

    def __str__(self):
        return self.name


class Homework(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Kutilmoqda'), # Pending
        ('approved', 'Qabul qilindi'), # Approved
        ('rejected', 'Rad etildi'), # Rejected
    )
    
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='homeworks')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='submissions')
    file = models.FileField(upload_to='homeworks/')
    comment = models.TextField(blank=True, help_text="Student's notes")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    feedback = models.TextField(blank=True, help_text="Admin/Teacher review")
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'lesson']

    def __str__(self):
        return f"{self.student.username} - {self.lesson.title} ({self.status})"

# ============================================================
# USER PROGRESS & ENROLLMENT
# ============================================================
class Enrollment(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['student', 'course']

    def __str__(self):
        return f"{self.student.username} -> {self.course.title}"

class UserProgress(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    last_unlocked_order = models.PositiveIntegerField(default=1) # The 'order' of the lesson student can access

    class Meta:
        unique_together = ['student', 'course']


class LessonWatchProgress(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='lesson_watches')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='watch_progresses')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ['student', 'lesson']
