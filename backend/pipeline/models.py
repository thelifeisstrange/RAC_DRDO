# pipeline/models.py
from django.db import models

class VerificationJob(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETE', 'Complete'),
        ('FAILED', 'Failed'),
    ]

    # Use a CharField for status with predefined choices
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Timestamps for tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Details about the run
    details = models.TextField(blank=True, null=True, help_text="Log messages or error details.")
    
    # Path to the final report
    report_file_path = models.CharField(max_length=512, blank=True, null=True)

    def __str__(self):
        return f"Job {self.id} - {self.status}"

    class Meta:
        ordering = ['-created_at']