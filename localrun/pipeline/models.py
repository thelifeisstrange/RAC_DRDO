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
    
class ParsedResult(models.Model):
    id = models.CharField(max_length=50, primary_key=True)   # file/student id

    input_name = models.TextField(null=True, blank=True)
    extracted_name = models.TextField(null=True, blank=True)
    name_status = models.CharField(max_length=10, null=True, blank=True)

    input_father_name = models.TextField(null=True, blank=True)
    extracted_father_name = models.TextField(null=True, blank=True)
    father_name_status = models.CharField(max_length=10, null=True, blank=True)

    input_reg_id = models.CharField(max_length=100, null=True, blank=True)
    extracted_reg_id = models.CharField(max_length=100, null=True, blank=True)
    reg_id_status = models.CharField(max_length=10, null=True, blank=True)

    input_year = models.CharField(max_length=10, null=True, blank=True)
    extracted_year = models.CharField(max_length=10, null=True, blank=True)
    year_status = models.CharField(max_length=10, null=True, blank=True)

    input_paper_code = models.CharField(max_length=50, null=True, blank=True)
    extracted_paper_code = models.CharField(max_length=50, null=True, blank=True)
    paper_code_status = models.CharField(max_length=10, null=True, blank=True)

    input_score = models.CharField(max_length=50, null=True, blank=True)
    extracted_score = models.CharField(max_length=50, null=True, blank=True)
    score_status = models.CharField(max_length=10, null=True, blank=True)

    input_scoreof100 = models.CharField(max_length=50, null=True, blank=True)
    extracted_scoreof100 = models.CharField(max_length=50, null=True, blank=True)
    scoreof100_status = models.CharField(max_length=10, null=True, blank=True)

    input_rank = models.CharField(max_length=50, null=True, blank=True)
    extracted_rank = models.CharField(max_length=50, null=True, blank=True)
    rank_status = models.CharField(max_length=10, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ParsedResult({self.id})"