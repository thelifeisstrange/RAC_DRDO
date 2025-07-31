# backend/users/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

# --- MANAGER FOR OUR CUSTOM USER MODEL ---
# This class defines how to create users and superusers without a 'username' field.
class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)

        # We create the user instance here
        user = self.model(email=email, **extra_fields)

        # set_password handles the hashing
        user.set_password(password)

        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN') # Superusers should be Admins

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

# --- THE CUSTOM USER MODEL ITSELF ---
class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        SCREENING_MEMBER = "SCREENING_MEMBER", "Screening Member"
        APPLICANT = "APPLICANT", "Applicant"

    # We override the default username field to make it optional and not unique.
    # This prevents database IntegrityErrors.
    username = models.CharField(max_length=150, unique=False, blank=True, null=True)

    # We make email the unique identifier.
    email = models.EmailField('email address', unique=True)

    # This is your custom role field.
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.APPLICANT)

    # We explicitly define the relationship fields from AbstractUser and give them
    # a unique 'related_name' to avoid clashing with the default User model.
    # This fixes the SystemCheckError.
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set', # Unique related_name
        blank=True,
        help_text='The groups this user belongs to.',
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_set', # Unique related_name
        blank=True,
        help_text='Specific permissions for this user.',
        related_query_name='user',
    )

    # We tell Django that the email field is the login identifier.
    USERNAME_FIELD = 'email'
    # We tell Django which fields are required when creating a user via createsuperuser.
    REQUIRED_FIELDS = ['first_name']

    # We assign our custom manager to the objects attribute.
    objects = CustomUserManager()

    def __str__(self):
        return self.email