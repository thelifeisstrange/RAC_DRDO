# localrun/pipeline/admin.py

from django.contrib import admin
from .models import VerificationJob, VerificationResult

@admin.register(VerificationJob)
class VerificationJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'status', 'created_at', 'updated_at', 'details')
    list_filter = ('status',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(VerificationResult)
class VerificationResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'created_at')
    list_filter = ('job',)
    readonly_fields = ('job', 'data', 'created_at')