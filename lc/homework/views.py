from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdminRole
from progress.services import try_unlock_next_lesson
from .models import Homework
from .serializers import HomeworkSerializer


class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin():
            return Homework.objects.all()
        return Homework.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def approve(self, request, pk=None):
        homework = self.get_object()
        homework.status = 'approved'
        homework.save()
        unlocked = try_unlock_next_lesson(homework.student, homework.lesson)
        return Response({'status': 'approved', 'unlocked_next': unlocked})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def reject(self, request, pk=None):
        homework = self.get_object()
        homework.status = 'rejected'
        homework.feedback = request.data.get('feedback', '')
        homework.save()
        return Response({'status': 'rejected'})
