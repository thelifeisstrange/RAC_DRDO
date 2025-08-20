# pipeline/models.py

from django.db import models

class VerificationJob(models.Model):
    """Represents a single, complete run of the verification pipeline."""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETE', 'Complete'),
        ('FAILED', 'Failed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    details = models.TextField(blank=True, null=True, help_text="Log messages or error details.")
    
    def __str__(self): 
        return f"Job {self.id} - {self.status}"

class VerificationResult(models.Model):
    """Stores the result for a single verified file."""
    job = models.ForeignKey(VerificationJob, related_name='results', on_delete=models.CASCADE)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Result for Job {self.job.id} - ID {self.data.get('id', 'N/A')}"