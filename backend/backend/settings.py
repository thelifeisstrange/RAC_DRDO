# backend/backend/settings.py

import os
from pathlib import Path
from dotenv import load_dotenv

# --- 1. BASE CONFIGURATION & .ENV LOADING ---
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file in the project's root directory
load_dotenv(BASE_DIR / '.env')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = []


# --- 2. APPLICATION DEFINITION ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 3rd Party Apps
    'rest_framework',
    'corsheaders', # Moved here for clarity, still high up
    'django_celery_results',
    'rest_framework_simplejwt',

    # Your local apps
    'pipeline',
    'users',
    'api',
]

MIDDLEWARE = [
    # CORS middleware should be as high as possible
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# --- 3. SERVER CONFIGURATION (WSGI for standard requests, ASGI for WebSockets) ---
WSGI_APPLICATION = 'backend.wsgi.application'


# --- 4. DATABASE CONFIGURATION ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'drdo_db',                # The name of the database we created
        'USER': 'drdo_user',               # The user we created
        'PASSWORD': '12345',   # The password you chose in Phase 2
        'HOST': 'localhost',               # Or '127.0.0.1'
        'PORT': '3306',                  # The default MySQL port
    }
}


# --- 5. PASSWORD VALIDATION ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# --- 6. INTERNATIONALIZATION ---
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# --- 7. STATIC & MEDIA FILES ---
STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# --- 8. MISC DJANGO SETTINGS ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# --- 9. THIRD-PARTY APP CONFIGURATION ---

# Django REST Framework (simple setup for now)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # This is the standard, correct setting from the library
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        # This is a good default to make most endpoints secure
        'rest_framework.permissions.IsAuthenticated',
    ]
}

# CORS Headers (Allow React dev server to connect)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
]

# --- 10. UNIFIED REAL-TIME CONFIGURATION (CELERY & CHANNELS) ---

# Define the single source of truth for our Redis connection
REDIS_URL = 'redis://127.0.0.1:6379/0'

# CELERY CONFIGURATION
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = 'django-db' # Store results in the Django database
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'


# --- 11. CUSTOM PIPELINE CONFIGURATION (Loaded from .env) ---
TOGETHER_API_KEY = os.getenv('TOGETHER_API_KEY')
POPPLER_PATH = os.getenv('POPPLER_PATH')
# MASTER_CSV_PATH = os.getenv('MASTER_CSV_PATH')
# SOURCE_FOLDER = os.getenv('SOURCE_FOLDER')
# COMPRESSED_FOLDER = os.getenv('COMPRESSED_FOLDER')
# VERIFICATION_EXCEL_PATH = os.getenv('VERIFICATION_EXCEL_PATH')

AUTH_USER_MODEL = 'users.CustomUser'

AUTHENTICATION_BACKENDS = [
    'users.backends.CustomUserBackend',
]