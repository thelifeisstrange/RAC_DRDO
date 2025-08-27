from django.db import models

class Advertisement(models.Model):
    """Represents a specific recruitment drive or verification event."""
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (ID: {self.id})"
    
