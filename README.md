# PitsaMaster

React/Vite frontend va Django REST backend.

## Local Ishga Tushirish

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Frontend:

```bash
npm install
npm run dev:frontend
```

Frontend API manzili `.env` faylida boshqariladi:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## PythonAnywhere Deploy

1. Loyihani PythonAnywhere serveriga yuklang, masalan:

```bash
git clone <repo-url> ~/proyekt
cd ~/proyekt/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

2. `backend/pythonanywhere_wsgi.py` ichidagi `yourusername` ni PythonAnywhere username bilan almashtiring.

3. PythonAnywhere `Web` bo'limida:

- Source code: `/home/yourusername/proyekt/backend`
- Working directory: `/home/yourusername/proyekt/backend`
- WSGI file: `backend/pythonanywhere_wsgi.py` dagi koddan foydalaning yoki shu faylni import qiling.
- Static files:
  - URL: `/static/`, Directory: `/home/yourusername/proyekt/backend/staticfiles`
  - URL: `/media/`, Directory: `/home/yourusername/proyekt/backend/media`

4. Environment variables:

```env
DJANGO_SECRET_KEY=long-random-secret
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourusername.pythonanywhere.com
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
CSRF_TRUSTED_ORIGINS=https://yourusername.pythonanywhere.com,https://your-frontend-domain.com
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=False
SECURE_HSTS_SECONDS=0
```

5. Frontend deploy qilayotganda `.env`:

```env
VITE_API_BASE_URL=https://yourusername.pythonanywhere.com
```

So'ng:

```bash
npm run build
```
