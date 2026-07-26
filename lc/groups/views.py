from rest_framework import permissions, viewsets

from accounts.permissions import IsAdminRole
from .models import StudyGroup
from .serializers import StudyGroupSerializer


class StudyGroupViewSet(viewsets.ModelViewSet):
    queryset = StudyGroup.objects.select_related('mentor', 'course').all()
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get('course_id')
        status_param = self.request.query_params.get('status')

        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset
