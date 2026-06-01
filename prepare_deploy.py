import os
import re
import sys

def main():
    print("=" * 60)
    print("      PITSA MASTER - PYTHONANYWHERE DEPLOYMENT CONFIGURATOR      ")
    print("=" * 60)
    print("\nThis script will prepare your project files for production deployment.")
    
    # 1. Ask for PythonAnywhere username
    username = ""
    while not username:
        username = input("Enter your PythonAnywhere username: ").strip().lower()
        if not username:
            print("Username cannot be empty!")
            
    # 2. Ask for Frontend domain (default to a vercel app based on username)
    default_frontend = f"https://pitsa-{username}.vercel.app"
    frontend_url = input(f"Enter your Frontend URL (default: {default_frontend}): ").strip()
    if not frontend_url:
        frontend_url = default_frontend
        
    # Ensure frontend URL has protocol and no trailing slash
    if not frontend_url.startswith(("http://", "https://")):
        frontend_url = "https://" + frontend_url
    if frontend_url.endswith("/"):
        frontend_url = frontend_url[:-1]
        
    print("\n[+] Configuring files...")
    
    # Paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    wsgi_path = os.path.join(base_dir, "backend", "pythonanywhere_wsgi.py")
    frontend_env_path = os.path.join(base_dir, ".env.production")
    
    # 3. Configure backend/pythonanywhere_wsgi.py
    if os.path.exists(wsgi_path):
        with open(wsgi_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Replace template placeholders
        content = content.replace("yourusername", username)
        content = content.replace("https://your-frontend-domain.com", frontend_url)
        
        # If secret key is template, generate new one
        if "change-this-to-a-long-random-secret" in content:
            import secrets
            prod_secret = "django-prod-secret-" + secrets.token_hex(24)
            content = content.replace("change-this-to-a-long-random-secret", prod_secret)
        
        with open(wsgi_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(content)
        print(f"[OK] Configured {os.path.relpath(wsgi_path, base_dir)}")
    else:
        print(f"[!] Warning: WSGI file not found at {wsgi_path}")
        
    # 4. Create .env.production for Frontend
    env_content = f"VITE_API_BASE_URL=https://{username}.pythonanywhere.com\n"
    with open(frontend_env_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(env_content)
    print(f"[OK] Created {os.path.relpath(frontend_env_path, base_dir)}")
    
    # 5. Create production env helper file for Django backend
    backend_env_example_path = os.path.join(base_dir, "backend", ".env.example")
    backend_env_production_path = os.path.join(base_dir, "backend", ".env.production")
    
    if os.path.exists(backend_env_example_path):
        with open(backend_env_example_path, "r", encoding="utf-8") as f:
            be_content = f.read()
            
        # Insert actual host and domain into allowed hosts and origins
        be_content = be_content.replace("yourusername.pythonanywhere.com", f"{username}.pythonanywhere.com")
        be_content = be_content.replace("https://your-frontend-domain.com", frontend_url)
        be_content = be_content.replace("change-this-to-a-long-random-secret", "django-prod-secret-" + os.urandom(16).hex())
        
        with open(backend_env_production_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(be_content)
        print(f"[OK] Created production env helper {os.path.relpath(backend_env_production_path, base_dir)}")

    print("\n" + "=" * 60)
    print("                      CONFIGURATION COMPLETE!                     ")
    print("=" * 60)
    print(f"\nYour files are successfully prepared! Here is what was updated:\n")
    print(f"1. WSGI config: backend/pythonanywhere_wsgi.py")
    print(f"   - PROJECT_DIR = '/home/{username}/proyekt/backend'")
    print(f"   - DJANGO_ALLOWED_HOSTS = '{username}.pythonanywhere.com'")
    print(f"2. Frontend production API URL in .env.production:")
    print(f"   - VITE_API_BASE_URL = 'https://{username}.pythonanywhere.com'")
    print(f"3. Backend production environment helper in backend/.env.production:")
    print(f"   - CORS_ALLOWED_ORIGINS = '{frontend_url}'")
    print(f"   - CSRF_TRUSTED_ORIGINS = 'https://{username}.pythonanywhere.com,{frontend_url}'")
    print("\n--- NEXT STEPS FOR DEPLOYMENT ---")
    print("\n[FRONTEND - VERCEL]")
    print("1. Build your frontend production bundle: npm run build")
    print("2. Import your repository to Vercel (https://vercel.com) and deploy it.")
    print("   Vercel will automatically read vercel.json and handle Single Page App routing.")
    print(f"   Note: Ensure VITE_API_BASE_URL in Vercel is set to: https://{username}.pythonanywhere.com")
    
    print("\n[BACKEND - PYTHONANYWHERE]")
    print(f"1. Go to PythonAnywhere dashboard and open a Bash console.")
    print(f"2. Clone your git repository into /home/{username}/proyekt")
    print(f"3. Go to the backend folder and setup your virtual environment:")
    print(f"   cd ~/proyekt/backend")
    print(f"   python -m venv venv")
    print(f"   source venv/bin/activate")
    print(f"   pip install -r requirements.txt")
    print(f"4. Run migrations and collect static files:")
    print(f"   python manage.py migrate")
    print(f"   python manage.py collectstatic --noinput")
    print(f"5. Set environment variables on PythonAnywhere (in your Web Tab or via a .env file).")
    print(f"6. In the PythonAnywhere 'Web' Tab, configure your web app:")
    print(f"   - Source code: /home/{username}/proyekt/backend")
    print(f"   - Working directory: /home/{username}/proyekt/backend")
    print(f"   - Virtualenv: /home/{username}/proyekt/backend/venv")
    print(f"   - WSGI configuration file: Point to /home/{username}/proyekt/backend/pythonanywhere_wsgi.py")
    print(f"   - Static files mappings:")
    print(f"     * URL: /static/  -->  Directory: /home/{username}/proyekt/backend/staticfiles")
    print(f"     * URL: /media/   -->  Directory: /home/{username}/proyekt/backend/media")
    print("\nDeployment preparation completed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
