# advertisements/models.py

from django.db import models

class Advertisement(models.Model):
    """
    Represents a specific recruitment drive or verification event.
    Each instance will have a dynamically created table for its results.
    """
    name = models.CharField(max_length=255, unique=True, help_text="A unique name for the advertisement (e.g., 'Scientist B Recruitment 2025').")
    created_at = models.DateTimeField(auto_now_add=True)

    def get_results_table_name(self):
        """
        Generates the unique, safe name for this advertisement's results table.
        Example: if the ID is 3, the table name will be 'parsed_results_3'.
        """
        return f"parsed_results_{self.id}"

    def __str__(self):
        return f"{self.name} (ID: {self.id})"