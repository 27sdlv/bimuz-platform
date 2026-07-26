from django.db.models import Q

from .models import Lesson


def get_lesson_position(lesson):
    return Lesson.objects.filter(course=lesson.course).filter(
        Q(order__lt=lesson.order) | Q(order=lesson.order, id__lte=lesson.id)
    ).count()
