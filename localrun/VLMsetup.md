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

*   **Gemma-3-Vision-Latex.Q3_K_S:** [Gemma-3-Vision-Latex.Q3_K_S.gguf](https://huggingface.co/mradermacher/Gemma-3-Vision-Latex-GGUF/resolve/main/Gemma-3-Vision-Latex.Q3_K_S.gguf)
*   **MM Projector:** [Gemma-3-Vision-Latex.mmproj-f16.gguf](https://huggingface.co/mradermacher/Gemma-3-Vision-Latex-GGUF/resolve/main/Gemma-3-Vision-Latex.mmproj-f16.gguf)

Download both and place them in a convenient folder, for example `C:\models\`.

---

### Step 7: Run the VLM Server!

Your compiled executable is located in `build\bin\Release`. You can now run the server.

```powershell
# Navigate to the output directory
cd build\bin\Release

# Run the server, pointing to your models
.\llama-server.exe --model C:\models\Gemma-3-Vision-Latex.Q3_K_S.gguf --mmproj C:\models\Gemma-3-Vision-Latex.mmproj-f16.gguf --n-gpu-layers 35
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