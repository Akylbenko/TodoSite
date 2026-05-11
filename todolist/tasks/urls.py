from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.get_tasks, name='get_tasks'),
    path('tasks/create/', views.create_task, name='create_task'),
    path('tasks/update/<int:pk>/', views.update_task, name='update_task'),
    path('tasks/delete/<int:pk>/', views.delete_task, name='delete_task'),
]