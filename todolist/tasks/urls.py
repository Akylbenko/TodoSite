from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.TaskListView.as_view(), name='get_tasks'),
    path('tasks/create/', views.TaskCreateView.as_view(), name='create_task'),
    path('tasks/update/<int:pk>/', views.TaskUpdateView.as_view(), name='update_task'),
    path('tasks/delete/<int:pk>/', views.TaskDeleteView.as_view(), name='delete_task'),
]