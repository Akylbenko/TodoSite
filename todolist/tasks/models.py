from django.db import models

class Task(models.Model):
    CATEGORY_CHOICES = [
        ('work', 'Работа'),
        ('personal', 'Личное'),
        ('shopping', 'Покупки'),
        ('other', 'Другое'),
    ]

    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title