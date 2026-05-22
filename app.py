import subprocess
import sys
import os

def main():
    print("Starting Flask Backend...")
    # Make sure we use the correct python executable
    backend_process = subprocess.Popen(
        [sys.executable, os.path.join("backend", "app.py")]
    )

    print("Starting Vite Frontend...")
    # Use npm run dev or bun run dev from the frontend folder
    # The shell=True is useful to resolve bun/npm from PATH
    frontend_command = "bun run dev" if os.system("bun --version > /dev/null 2>&1") == 0 else "npm run dev"
    frontend_process = subprocess.Popen(
        frontend_command, 
        cwd="frontend",
        shell=True
    )

    try:
        # Wait for both processes
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down both servers...")
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.wait()
        frontend_process.wait()
        print("Servers stopped.")

if __name__ == "__main__":
    main()
