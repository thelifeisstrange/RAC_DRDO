
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
# Ensures Python output is sent straight to the terminal without buffering
ENV PYTHONUNBUFFERED 1
# Set the working directory inside the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential tesseract-ocr && rm -rf /var/lib/apt/lists/*

#Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

#Copy your application code into the container
COPY . /app/
