from rest_framework import serializers
from .models import Task

class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'completed', 'category', 'created_at']

class TaskSerializer(serializers.ModelSerializer):
    subtasks = SubtaskSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'completed', 'category', 'parent', 'created_at', 'subtasks']