
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
# Ensures Python output is sent straight to the terminal without buffering
ENV PYTHONUNBUFFERED 1
# Set the working directory inside the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential

#Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

#Copy your application code into the container
COPY . /app/

# This is a crucial step. The script needs permission to run.
RUN chmod +x /app/entrypoint.sh

# Step 8: Set the entrypoint script as the command to run on container start
ENTRYPOINT ["/app/entrypoint.sh"]