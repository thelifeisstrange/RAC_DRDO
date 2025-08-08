# backend/users/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    can_manage_users = models.BooleanField(default=False)
    can_screen_applications = models.BooleanField(default=False)
    can_manage_roles = models.BooleanField(default=False)
    is_deletable = models.BooleanField(default=True)

    def __str__(self):
        return self.name

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

    # The NEW, correct method
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        # Create the user first
        user = self.create_user(email, password, **extra_fields)

        # Now, find the 'ADMIN' role and assign it.
        # This assumes the seed_roles data migration has run, which we will do later.
        try:
            admin_role = Role.objects.get(name='ADMIN')
            user.role = admin_role
            user.save(using=self._db)
        except Role.DoesNotExist:
            # We handle the case where the roles haven't been seeded yet.
            # During the initial createsuperuser, this will be skipped, and we'll assign the role manually.
            pass

        return user

# --- THE CUSTOM USER MODEL ITSELF ---
class CustomUser(AbstractUser):
    # We override the default username field to make it optional and not unique.
    # This prevents database IntegrityErrors.
    username = models.CharField(max_length=150, unique=False, blank=True, null=True)

    # We make email the unique identifier.
    email = models.EmailField('email address', unique=True)

    # This is your custom role field.
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)

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