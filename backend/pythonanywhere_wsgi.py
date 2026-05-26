import os
import sys
from pathlib import Path


PROJECT_DIR = Path("/home/yourusername/proyekt/backend")

if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
os.environ.setdefault("DJANGO_DEBUG", "False")
os.environ.setdefault("DJANGO_ALLOWED_HOSTS", "yourusername.pythonanywhere.com")

from django.core.wsgi import get_wsgi_application


application = get_wsgi_application()
