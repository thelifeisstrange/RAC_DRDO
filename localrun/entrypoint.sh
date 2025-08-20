#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Creating migrations for the 'pipeline' app..."
# Create migration files for your local app's models
python manage.py makemigrations pipeline

echo "Applying database migrations for all apps..."

python manage.py migrate

echo "Starting Docker Containerization..."
exec "$@"