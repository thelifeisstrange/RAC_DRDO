# DRDO Application Portal

This repository contains the backend (Django + MySQL) and frontend (Vite + React) code for the DRDO application portal.

---

## Installation & Setup Guide

Follow these steps **exactly** to set up and run the project.

---

### **STEP 1: Create a Virtual Environment**

First, create and activate a Python virtual environment for the backend.

```bash
python3 -m venv venv
source venv/bin/activate
```

---

### **STEP 2: Install all dependencies**

Install all required Python libraries from `requirements.txt`.

```bash
pip install -r requirements.txt
```

---

### **STEP 3: Establish the Database**

Log into MySQL and create the database.

```bash
mysql -u <username> -p
CREATE DATABASE drdo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Now, configure your database connection in `backend/backend/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'drdo_db',         # Database name from CREATE DATABASE
        'USER': 'your_mysql_user', # Your MySQL username
        'PASSWORD': 'your_mysql_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

---

### **STEP 4: Prepare and Run Database Migrations**

Clear previous migration files if any from `api`, `users`, and `pipeline` apps.

Run:

```bash
python manage.py migrate
python manage.py createsuperuser
```

---

### **STEP 5: Seed Database with User Roles**

Generate an empty migration file:

```bash
python manage.py makemigrations users --empty --name seed_roles
```

Add the following code to `backend/users/migrations/0002_seed_roles.py`:

```python
from django.db import migrations

def seed_roles(apps, schema_editor):
    Role = apps.get_model('users', 'Role')

    Role.objects.create(
        name='ADMIN',
        can_manage_users=True,
        can_screen_applications=True,
        can_manage_roles=True,
        is_deletable=False
    )

    Role.objects.create(
        name='SCREENING_MEMBER',
        can_screen_applications=True,
        is_deletable=False
    )

    Role.objects.create(
        name='APPLICANT',
        is_deletable=False
    )

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]
    operations = [
        migrations.RunPython(seed_roles),
    ]
```

Run migrations again:

```bash
python manage.py migrate
```

---

### **STEP 6: Assign Admin Role to Superuser**

Open the Django shell:

```bash
python manage.py shell
```

Run:

```python
from users.models import CustomUser, Role
admin_role = Role.objects.get(name='ADMIN')
superuser = CustomUser.objects.get(email='your super user email')
superuser.role = admin_role
superuser.save()
print(superuser.role)  # Should print: ADMIN
```

Exit the shell.

---

### **STEP 7: Run Backend Server**

```bash
python manage.py runserver
```

---

### **STEP 8: Run Frontend**

```bash
cd frontend
npm install
npm run dev
```

---

## You’re Ready to Build!

The backend will run on `http://127.0.0.1:8000` and the frontend on the Vite development server.
