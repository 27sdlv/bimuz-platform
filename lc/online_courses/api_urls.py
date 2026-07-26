from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('', include('core.urls')),
    path('', include('accounts.urls')),
    path('', include('courses.urls')),
    path('', include('groups.urls')),
    path('', include('homework.urls')),
    path('', include('progress.urls')),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
