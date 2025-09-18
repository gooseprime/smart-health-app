import os
import sys
import subprocess

def run_dashboard():
    """
    Run the Streamlit dashboard application.
    """
    # Get the directory of this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to the app.py file
    app_path = os.path.join(current_dir, "app.py")
    
    # Check if app.py exists
    if not os.path.exists(app_path):
        print(f"Error: Dashboard app not found at {app_path}")
        return False
    
    # Run the Streamlit app
    try:
        print("Starting Outbreak Prediction Dashboard...")
        subprocess.run(["streamlit", "run", app_path], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running Streamlit dashboard: {e}")
        return False
    except FileNotFoundError:
        print("Error: Streamlit not found. Please install it with 'pip install streamlit'")
        return False

if __name__ == "__main__":
    run_dashboard()