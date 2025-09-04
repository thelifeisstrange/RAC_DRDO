# Document Verification Pipeline

## Table of Contents

1.  [Project Architecture](#1-project-architecture)
2.  [Technology Stack](#2-technology-stack)
3.  [Setup & Installation](#3-setup--installation)
    -   [Prerequisites](#prerequisites)
    -   [Backend Setup (Docker)](#backend-setup-docker)
    -   [Frontend Setup](#frontend-setup)
4.  [Local Model Setup (Gemma)](#4-local-model-setup-gemma)
5.  [Running the Application](#5-running-the-application)
6.  [Workflow Guide](#6-workflow-guide)

---

## 1. Project Architecture

The application is composed of three main, independent parts that communicate over a network:

```
+----------------+      HTTP       +-----------------+      HTTP      +----------------+
| React Frontend | <------------> |  Django Backend | <------------> |  Local Model   |
| (localhost:5173)| (runs on host) | in Docker on   | (in Docker on  |     Server     |
|                |                | localhost:8000) | (in Docker)    | (localhost:8080)|
+----------------+                +-----------------+                +----------------+
                                       |         ^
                                       |         | Task Queue
                                       V         |
                                     +-----------+
                                     |  Celery   |
                                     | (in Docker)|
                                     +-----------+
```

---

## 2. Technology Stack

-   **Frontend:** React (Vite), Axios
-   **Backend:** Django, Django REST Framework, Celery
-   **Database:** MySQL (running in Docker)
-   **Task Queue:** Redis (running in Docker)
-   **AI Model:** Gemma 3 Vision (served via `llama.cpp`)
-   **Containerization:** Docker

---

## 3. Setup & Installation

### Prerequisites

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for macOS or Windows)
-   [Node.js](https://nodejs.org/en) (v18 or newer) and `npm`
-   A local copy of the Gemma 3 Vision model files (see Model Setup section).
- [Poppler](https://github.com/oschwartz10612/poppler-windows/releases/tag/v25.07.0-0)

### Backend Setup (Docker)

The entire backend is managed by Docker Compose, making setup incredibly simple.

1.  **Navigate to the Backend Project:**
    Open a terminal and navigate to the `localrun` directory.
    ```bash
    cd /path/to/your/project/localrun
    ```

2.  **Configure the Environment:**
    *   Rename the `.env.example` file to `.env`.
    *   Open the `.env` file and fill in all the required variables:
        *   `SECRET_KEY`: Generate a new Django secret key.
        *   `DEBUG`: Set to `True` for development.
        *   **Database Credentials:** Set `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `DB_ROOT_PASSWORD`.
        *   **Poppler Path (if processing PDFs):** Provide the path to your Poppler `bin` directory 

3.  **Build and Start the Services:**
    This single command will build the custom Docker image, download Redis and MySQL, and start all backend services.
    ```bash
    docker-compose up --build
    ```
    The first time you run this, it may take several minutes to download and build everything. Subsequent starts will be much faster.

4.  **Run Initial Database Migrations:**
    *   Open a **second, new terminal**.
    *   Navigate to the `localrun` directory.
    *   Execute the following commands to set up the database tables and create an admin user inside the running `web` container:
    ```bash
    docker-compose exec web python manage.py makemigrations
    docker-compose exec web python manage.py migrate
    docker-compose exec web python manage.py createsuperuser
    ```

Your entire backend is now running.

### Frontend Setup

1.  **Navigate to the Frontend Project:**
    Open a **third, new terminal** and navigate to the `localfrontend` directory.
    ```bash
    cd /path/to/your/project/localfrontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    The frontend will now be accessible at `http://localhost:5173`.

---

## 4. Local Model Setup (Gemma)

# VLM Setup Guide for llama.cpp on Windows with NVIDIA CUDA

This guide provides a comprehensive, step-by-step process for compiling `llama.cpp` on a modern Windows system with an NVIDIA GPU. It is specifically tailored to build support for Vision Language Models (VLMs) like Gemma-3-Vision-Latex and includes solutions to common errors encountered during the process.

## 1. Prerequisites: Required Software

Before you begin, ensure you have the following software installed.

| Software              | Minimum Version      | Notes                                                    |
| :-------------------- | :------------------- | :------------------------------------------------------- |
| **Git**               | Any recent version   | For cloning the repository.                              |
| **CMake**             | 3.18+                | The build system generator.                              |
| **Visual Studio 2022**| Community/Pro/Ent.   | The C++ compiler and IDE. **Specific components are required.** |
| **NVIDIA CUDA Toolkit**| 12.1+               | Provides the CUDA compiler (`nvcc`) and libraries.       |
| **NVIDIA GPU Driver** | Latest version       | Game Ready or Studio drivers are both fine.              |

---

## 2. Installation and Setup

Follow these steps in order. Do not skip any.

### Step 1: Install Core Development Tools

1.  **Install Git:** Download and install from [git-scm.com](https://git-scm.com/download/win).
2.  **Install CMake:** Download and install the "Windows x64 Installer" from [cmake.org/download](https://cmake.org/download/). During installation, **select the option to add CMake to the system PATH for all users.**
3.  **Install Visual Studio 2022:**
    *   Download the Visual Studio Installer from [visualstudio.microsoft.com](https://visualstudio.microsoft.com/downloads/). The "Community" edition is free and sufficient.
    *   Run the installer.
    *   Go to the **"Workloads"** tab.
    *   Check the box for **"Desktop development with C++"**. This is the most critical step and includes the MSVC compiler, Windows SDK, and CMake tools.
    *   Click "Install".

4.  **Install NVIDIA CUDA Toolkit:**
    *   Download the toolkit (version 12.1 or newer) from the [NVIDIA Developer website](https://developer.nvidia.com/cuda-toolkit-archive).
    *   Run the installer. Choose the **Custom (Advanced)** installation.
    *   Ensure the component for **"Visual Studio Integration"** is checked. This is crucial for CMake to find the CUDA toolset.

5.  **Add C++ CUDA Tools to Visual Studio:**
    *   After installing the CUDA Toolkit, open the **Visual Studio Installer** again.
    *   Click **"Modify"** on your Visual Studio 2022 installation.
    *   Go to the **"Individual components"** tab.
    *   In the search bar, type `CUDA`.
    *   Check the box for **"C++ CUDA tools"**. This option will only be visible *after* the CUDA Toolkit has been installed.
    *   Click "Modify" to install the component.

### Step 2: Clone the llama.cpp Repository

Open a new PowerShell or Command Prompt terminal and clone the project.

```bash
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
```

### Step 3: Install Dependencies (vcpkg & cURL)

`llama.cpp` uses the cURL library for downloading models. We will install it using the `vcpkg` package manager.

**Create a development directory and install vcpkg:**

```powershell
# Create a folder for development tools
mkdir C:\dev

# Navigate into it
cd C:\dev

# Clone and set up vcpkg
git clone https://github.com/microsoft/vcpkg.git
.\vcpkg\bootstrap-vcpkg.bat

# Install the cURL library:
C:\dev\vcpkg\vcpkg.exe install curl:x64-windows

# Navigate back to your llama.cpp directory: (Replace your_username and path\to as needed)
cd C:\Users\your_username\path\to\llama.cpp
```

### Step 4: Configure the Build with CMake (The Critical Step)

This is the most important command. It tells CMake how to generate the build files for Visual Studio, enabling CUDA and pointing to our dependencies.

1.  **Find your GPU's Compute Capability:**
    *   Open a terminal and run `nvidia-smi`.
    *   Look at the "Compute Cap." column. For an RTX 2050, this is `8.6`.
    *   For the CMake flag, you will use the numbers without the dot (e.g., `8.6` becomes `86`).

2.  **Run the CMake Command:**
    From the root of your `llama.cpp` directory, run the following command. Replace `86` with your GPU's compute capability if it's different.

    ```powershell
    cmake -B build -G "Visual Studio 17 2022" -A x64 -DGGML_CUDA=ON -DCMAKE_TOOLCHAIN_FILE=C:/dev/vcpkg/scripts/buildsystems/vcpkg.cmake -DCMAKE_CUDA_ARCHITECTURES="75;86"
    ```

    > #### Anatomy of the Command
    > *   `-B build`: Creates the build files in a new directory named `build`.
    > *   `-G "Visual Studio 17 2022"`: Specifies the generator.
    > *   `-A x64`: Specifies a 64-bit build.
    > *   `-DGGML_CUDA=ON`: Enables CUDA compilation.
    > *   `-DCMAKE_TOOLCHAIN_FILE=...`: Tells CMake how to find libraries installed by `vcpkg` (like cURL).
    > *   `-DCMAKE_CUDA_ARCHITECTURES="75;86"`: **This is the crucial fix.** It tells the CUDA compiler to:
    >     *   Include compatibility code for an older architecture (`75`), which prevents the `arch <= 750` runtime error.
    >     *   Generate native, optimized machine code for your specific GPU architecture (`86`).

    After running, you should see the line: `-- Using CUDA architectures: 75;86`. If you see this, you are ready to compile.

---

### Step 5: Compile the Project

Run the following command from the root of the `llama.cpp` directory. This will start the build process, which can take several minutes.

```powershell
cmake --build build --config Release
```

### Step 6: Download VLM Models

You need two files for Gemma-3-Vision-Latex: the main model weights and the separate projector file.

[text](https://huggingface.co/mradermacher/Gemma-3-Vision-Latex-GGUF#provided-quants)

*   **Gemma-3-Vision-Latex.Q4_K_S:** [Gemma-3-Vision-Latex.Q4_K_S.gguf](https://huggingface.co/mradermacher/Gemma-3-Vision-Latex-GGUF/resolve/main/Gemma-3-Vision-Latex.Q4_K_S.gguf)
*   **MM Projector:** [Gemma-3-Vision-Latex.mmproj-f16.gguf](https://huggingface.co/mradermacher/Gemma-3-Vision-Latex-GGUF/resolve/main/Gemma-3-Vision-Latex.mmproj-f16.gguf)

Download both and place them in a convenient folder, for example `C:\models\`.

---

### Step 7: Run the VLM Server!

Your compiled executable is located in `build\bin\Release`. You can now run the server.

```powershell
# Navigate to the output directory
cd build\bin\Release

# Run the server, pointing to your models
.\llama-server.exe --model C:\models\Gemma-3-Vision-Latex.Q4_K_S.gguf --mmproj C:\models\Gemma-3-Vision-Latex.mmproj-f16.gguf --n-gpu-layers 35
```

*   `--n-gpu-layers 35`: This offloads 35 layers to the GPU. You can adjust this number based on your GPU's VRAM.

If successful, the server will start, and you can access the web interface at `http://127.0.0.1:8080`.

---

## 3. Troubleshooting Common Errors

*   **ERROR:** `CMake Error ... No CUDA toolset found.`
    *   **Cause:** Visual Studio is missing the CUDA integration.
    *   **Solution:** Follow **Step 1.5** to open the Visual Studio Installer and add the **"C++ CUDA tools"** individual component.

*   **ERROR:** `Could NOT find CURL.`
    *   **Cause:** The cURL library was not found.
    *   **Solution:** Follow **Step 3** to install `vcpkg` and `curl`. Ensure the `-DCMAKE_TOOLCHAIN_FILE` path in your CMake command is correct.

*   **ERROR:** `ggml was not compiled with any CUDA arch <= 750`
    *   **Cause:** This is a subtle build system bug. The code requires a flag for an older architecture to be present during compilation for its internal logic to work correctly, even if you are only targeting a new GPU.
    *   **Solution:** This is solved by the specific flag in **Step 4.2**. You **must** include an older architecture alongside your native one, for example: `-DCMAKE_CUDA_ARCHITECTURES="75;86"`.

*   **General Advice:** If a build fails after you change a CMake option, it is best practice to **completely delete the `build` directory** and re-run the `cmake` command from scratch to ensure no old settings are cached.

## 5. Running the Application

To run the full application, you need to have multiple terminals open and running simultaneously.

1.  **Terminal 1: Local Model Server**
    *   Navigate to your `llama.cpp/build/bin/Release` directory.
    *   Start the server with your model files.
    ```powershell
    ./llama-server.exe --model {modelpath}Gemma-3-Vision-Latex.gguf --mmproj [modelpath]Gemma-3-Vision-Latex.mmproj --n-gpu-layers 35
    ```

2.  **Terminal 2: Docker Stack (Backend)**
    *   Navigate to the `localrun` project directory.
    *   Start all backend services.
    ```bash
    docker-compose up
    ```

3.  **Terminal 3: React Frontend**
    *   Navigate to the `frontend` project directory.
    *   Start the development server.
    ```bash
    npm run dev
    ```

---

## 6. Workflow Guide

### Data Folder Structure

The backend is configured to access source documents from a shared folder. It expects a specific structure:

1.  Create a main data directory on your host machine (e.g., `C:\docker_data` or `~/docker_data`).
2.  Mount this directory into the Docker containers by editing the `volumes` section in `docker-compose.yml`.
3.  Inside this shared directory, organize your documents as follows:
    ```
    <shared_data_folder>/
    └── <your_dataset_name>/
        ├── can_<applicant_id_1>/
        │   ├── gate_scorecard.jpg
        │   └── marksheet.pdf
        └── can_<applicant_id_2>/
            ├── gate_scorecard.png
            └── ...
    ```

### Using the Application

1.  Open the frontend in your browser at `http://localhost:5173`.
2.  **Step 1: Upload Master CSV:** Upload the master data file containing the ground truth for all applicants.
3.  **Step 2: Specify Source Folder:** Enter the **path to the dataset folder as the container sees it**. For example, if you mounted your shared folder to `/data` in Docker, you would enter `/data/your_dataset_name`.
4.  Click **"Run Verification Pipeline"**.
5.  The UI will show a live progress screen.
6.  Once complete, the results table will appear, allowing you to review the verification details for each document.