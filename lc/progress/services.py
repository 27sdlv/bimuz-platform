from django.db.models import Q

from courses.lesson_utils import get_lesson_position
from courses.models import Lesson
from homework.models import Homework
from .models import Enrollment, LessonWatchProgress, UserProgress


def is_lesson_unlocked(student, lesson):
    if student.is_admin():
        return True
    if not Enrollment.objects.filter(student=student, course=lesson.course, is_active=True).exists():
        return False
    progress, _ = UserProgress.objects.get_or_create(student=student, course=lesson.course)
    return get_lesson_position(lesson) <= progress.last_unlocked_order


def try_unlock_next_lesson(student, lesson):
    progress, _ = UserProgress.objects.get_or_create(student=student, course=lesson.course)
    lesson_position = get_lesson_position(lesson)
    if lesson_position != progress.last_unlocked_order:
        return False

    homework_ok = Homework.objects.filter(student=student, lesson=lesson, status='approved').exists()
    watched_ok = LessonWatchProgress.objects.filter(student=student, lesson=lesson, is_completed=True).exists()

    if homework_ok and watched_ok:
        progress.last_unlocked_order += 1
        progress.save(update_fields=['last_unlocked_order'])
        return True
    return False
