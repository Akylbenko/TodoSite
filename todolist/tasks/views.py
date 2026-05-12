from rest_framework import generics, status
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer

class TaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.all().order_by('-created_at')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        if category and category != 'all':
            queryset = queryset.filter(category=category)
        if search:
            queryset = queryset.filter(title__icontains=search)
        return queryset

class TaskCreateView(generics.CreateAPIView):
    serializer_class = TaskSerializer

class TaskUpdateView(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    lookup_url_kwarg = 'pk'

class TaskDeleteView(generics.DestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    lookup_url_kwarg = 'pk'