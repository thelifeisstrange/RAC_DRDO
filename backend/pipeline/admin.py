# pipeline/admin.py
from django.contrib import admin
from .models import VerificationJob

@admin.register(VerificationJob)
class VerificationJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'status', 'created_at', 'updated_at', 'report_file_path')
    list_filter = ('status',)
    readonly_fields = ('created_at', 'updated_at')