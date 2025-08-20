# Step 1: Use an official Python runtime as a parent image
# We're using Python 3.11, which is stable and well-supported.
FROM python:3.11-slim

# Step 2: Set environment variables
# Prevents Python from writing .pyc files to a cache directory
ENV PYTHONDONTWRITEBYTECODE 1
# Ensures Python output is sent straight to the terminal without buffering
ENV PYTHONUNBUFFERED 1

# Step 3: Set the working directory inside the container
WORKDIR /app

# Step 4: Install system dependencies
# Some Python packages need system libraries to compile.
# `build-essential` is a common requirement for many packages.
RUN apt-get update && apt-get install -y build-essential

# Step 5: Install Python dependencies
# First, copy only the requirements file to leverage Docker's layer caching.
# If requirements.txt doesn't change, Docker won't re-run this step.
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Step 6: Copy your application code into the container
# The first '.' is your local project directory, the second '.' is the WORKDIR in the container.
COPY . /app/