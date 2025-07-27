# backend/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # We will add our own 'role' field here
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        SCREENING_MEMBER = "SCREENING_MEMBER", "Screening Member"
        APPLICANT = "APPLICANT", "Applicant"

    # The actual role field
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.APPLICANT)
