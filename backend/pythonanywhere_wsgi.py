import os
import sys
from pathlib import Path


PROJECT_DIR = Path("/home/kamronbek/proyekt/backend")

if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
os.environ.setdefault("DJANGO_DEBUG", "False")
os.environ.setdefault("DJANGO_ALLOWED_HOSTS", "kamronbek.pythonanywhere.com")
os.environ.setdefault("CORS_ALLOWED_ORIGINS", "https://pitsa-kamronbek.vercel.app")
os.environ.setdefault("CSRF_TRUSTED_ORIGINS", "https://kamronbek.pythonanywhere.com,https://pitsa-kamronbek.vercel.app")
os.environ.setdefault("DJANGO_SECRET_KEY", "django-prod-secret-cc114373d9608a82eb4d0da2357fde31acb909cae8bfbc46")

from django.core.wsgi import get_wsgi_application


application = get_wsgi_application()
