# Project Setup and Docker Deployment Guide

This document provides step-by-step instructions for setting up the project environment, configuring it to use the Together AI API, and running the application using Docker.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
*   **Python** (3.9 or higher) and **pip**
*   **Python `venv` module** (usually included with Python)
*   **Docker** and **Docker Compose**
*   **Tesseract OCR Engine**: This is required for local development and for the orientation correction worker. The Docker setup handles this automatically inside the container, but you need it on your host machine to run local management commands.
    *   **Ubuntu/Debian**: `sudo apt install tesseract-ocr`
    *   **macOS (Homebrew)**: `brew install tesseract`
    *   **Windows**: Download and install from the [official Tesseract project page](https://github.com/UB-Mannheim/tesseract/wiki).

---

## Step 1: Initial Local Setup

First, set up a local Python environment and install the required dependencies.

1.  **Create a Virtual Environment:**
    ```bash
    python -m venv env
    ```

2.  **Activate the Virtual Environment:**
    *   On **Windows** (Command Prompt):
        ```cmd
        env\Scripts\activate
        ```
    *   On **Linux / macOS**:
        ```bash
        source env/bin/activate
        ```

3.  **Install Python Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

---

## Step 2: Environment Configuration

The application uses an `.env` file to manage secret keys and other environment variables.

1.  **Create the `.env` file** by copying the example file:
    *   On **Windows** (Command Prompt):
        ```cmd
        copy .env.example .env
        ```
    *   On **Linux / macOS**:
        ```bash
        cp .env.example .env
        ```

2.  **Edit the `.env` file** and fill in all the required values, especially your `TOGETHER_API_KEY`.
    ```dotenv
    # .env

    # Secret key for Django
    SECRET_KEY='your-django-secret-key-here'

    # Set to False in production
    DEBUG=True

    # Your Together AI API Key
    TOGETHER_API_KEY='sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

    # Database settings (defaults for local Docker setup)
    POSTGRES_DB=yourdb
    POSTGRES_USER=youruser
    POSTGRES_PASSWORD=yourpassword
    ```

---

## Step 3: Database Setup (Django Migrations)

Run the following commands in order to prepare the database schema.

1.  **Make Migrations for the Main App:**
    ```bash
    python manage.py makemigrations
    ```

2.  **Make Migrations for the `pipeline` App:**
    ```bash
    python manage.py makemigrations pipeline
    ```

3.  **Apply the Migrations to the Database:**
    ```bash
    python manage.py migrate
    ```

---

## Step 4: Configure for API-Based Extraction

To switch from the local model worker to the cloud-based **Together AI API**, you need to make the following code changes.

#### 4.1. In `localrun/localrun/settings.py`
Uncomment the line that reads the API key from your `.env` file.

```python
# localrun/localrun/settings.py

# ... other settings
# Uncomment the following line:
TOGETHER_API_KEY = os.getenv('TOGETHER_API_KEY')
```

#### 4.2. In `localrun/pipeline/tasks.py`
Modify the imports and uncomment the client initialization call.

1.  **Adjust the worker imports:**
    ```python
    # localrun/pipeline/tasks.py

    # --- BEFORE ---
    # from .workers.compress_worker import process_and_compress
    # from .workers.local_extract_worker import extract_and_parse, extract_single_field
    # from .workers.extract_worker import extract_and_parse, extract_single_field, initialize_client
    # from .workers.orientation_worker import correct_orientation_in_place

    # --- AFTER ---
    from .workers.compress_worker import process_and_compress
    # Comment out the local worker import
    # from .workers.local_extract_worker import extract_and_parse, extract_single_field
    # Uncomment the API worker import
    from .workers.extract_worker import extract_and_parse, extract_single_field, initialize_client
    from .workers.orientation_worker import correct_orientation_in_place
    ```

2.  **Initialize the API client:** Inside the `run_verification_pipeline` task (around line 25), uncomment the `initialize_client()` call.
    ```python
    # localrun/pipeline/tasks.py

    @shared_task
    def run_verification_pipeline(job_id, master_csv_path, source_file_paths):
        # ...
        try:
            # Uncomment the following line:
            initialize_client()
            master_df = load_and_prepare_csv(master_csv_path)
            # ...
    ```

---

## Step 5: Running the Application with Docker

With the setup complete, you can now build and run the entire application stack using Docker Compose.

1.  **Ensure Docker Engine is running.**

2.  **First-Time Run or After Changes:**
    If you are running the application for the first time, or if you have made any changes to the `Dockerfile`, `requirements.txt`, or other configuration files, you must use the `--build` flag.
    ```bash
    docker-compose up --build
    ```

3.  **Subsequent Runs:**
    For subsequent runs where no configuration has changed, you can start the containers without rebuilding.
    ```bash
    docker-compose up
    ```
    *(You can add the `-d` flag to run the containers in detached mode: `docker-compose up -d`)*

4.  **Stopping the Application:**
    To stop all running containers and remove the network, press `Ctrl+C` in the terminal where `docker-compose` is running, or use the following command from another terminal:
    ```bash
    docker-compose down
    ```


/data/documents/datasets