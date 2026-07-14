# Backend — Buddy Script API

Django REST Framework API powering the social media app: email/JWT authentication and a social feed (posts, comments, replies, likes).

## Tech stack

- **Django 5.2** + **Django REST Framework**
- **djangorestframework-simplejwt** — JWT access/refresh authentication
- **drf-spectacular** — OpenAPI schema + Swagger UI
- **django-cors-headers** — CORS for the Next.js frontend
- **Pillow** — image handling for post uploads
- **WhiteNoise** — static file serving in production
- SQLite for local dev, Postgres in production (via `dj-database-url` + `psycopg`)

## Project structure

```
backend/
├── apps/
│   ├── auth/       # Custom user model (email-based), register/login/me endpoints
│   └── feed/       # Posts, comments, replies, likes
├── src/            # Django project: settings, root urls, asgi/wsgi
├── manage.py
└── requirements.txt
```

## Setup

1. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   .venv\Scripts\activate      # Windows
   source .venv/bin/activate   # macOS/Linux
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in `backend/` (see [Environment variables](#environment-variables) below).

4. Apply migrations and create an admin user:

   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. Run the dev server:

   ```bash
   python manage.py runserver
   ```

   The API is served at `http://127.0.0.1:8000/`.

## Environment variables

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | Django secret key | `django-insecure-...` |
| `DEBUG` | Enables debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `127.0.0.1, localhost` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins allowed to call the API (the frontend) | `http://localhost:3000, http://127.0.0.1:3000` |
| `CSRF_TRUSTED_ORIGINS` | Comma-separated trusted origins for CSRF | `http://127.0.0.1` |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token lifetime, in minutes | `60` |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Refresh token lifetime, in days | `7` |
| `STATIC_ROOT` | Directory static files are collected into | `static` |
| `MEDIA_ROOT` | Directory uploaded media (post images) are stored in | `media` |
| `DATABASE_URL` | Postgres connection string (production only — falls back to local SQLite when unset) | `postgresql://user:pass@host:5432/db` |

## Authentication

The user model is email-based (no `username` field). Auth uses JWT bearer tokens issued on login/register and sent as `Authorization: Bearer <access_token>`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register/` | Create an account (`first_name`, `last_name`, `email`, `password`) |
| `POST` | `/api/auth/login/` | Log in with `email`/`password`, returns `access`, `refresh`, and `user` |
| `POST` | `/api/auth/token/refresh/` | Exchange a `refresh` token for a new `access` token |
| `GET` | `/api/auth/me/` | Get the current authenticated user |

## Feed

| Method | Endpoint | Description |
|---|---|---|
| `GET`, `POST` | `/api/feed/posts/` | List / create posts |
| `GET`, `PATCH`, `DELETE` | `/api/feed/posts/<id>/` | Retrieve, update, or delete a post |
| `POST` | `/api/feed/posts/<id>/like/` | Toggle a like on a post |
| `GET` | `/api/feed/posts/<id>/likes/` | List users who liked a post |
| `GET`, `POST` | `/api/feed/posts/<id>/comments/` | List / create comments on a post |
| `POST` | `/api/feed/comments/<id>/like/` | Toggle a like on a comment |
| `GET` | `/api/feed/comments/<id>/likes/` | List users who liked a comment |
| `GET`, `POST` | `/api/feed/comments/<id>/replies/` | List / create replies on a comment |
| `POST` | `/api/feed/replies/<id>/like/` | Toggle a like on a reply |
| `GET` | `/api/feed/replies/<id>/likes/` | List users who liked a reply |

Posts support an optional image (`multipart/form-data`, max 5MB) and a `visibility` of `public` or `private`.

## API documentation

With the server running:

- Swagger UI: `http://127.0.0.1:8000/api/docs/`
- Raw OpenAPI schema: `http://127.0.0.1:8000/api/schema/`

## Admin

Django admin is available at `http://127.0.0.1:8000/admin/` (requires a superuser, see setup step 4).

## Deployment

Deployed on [Railway](https://railway.app) with a managed Postgres add-on and a persistent volume mounted at `MEDIA_ROOT` for uploaded post images. Railway builds with Nixpacks (Python version pinned in `.python-version`) and reads `railway.json` for the start command, pre-deploy `migrate`/`collectstatic` step, and restart policy.

In addition to the local dev variables above, set these in the Railway service's Variables tab:

| Variable | Value |
|---|---|
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `${{RAILWAY_PUBLIC_DOMAIN}}` |
| `CSRF_TRUSTED_ORIGINS` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` |
| `CORS_ALLOWED_ORIGINS` | the deployed frontend's origin, e.g. `https://your-app.vercel.app` |
| `DATABASE_URL` | reference to the Postgres service, e.g. `${{Postgres.DATABASE_URL}}` |
| `MEDIA_ROOT` | `/data` (must match the attached volume's mount path) |
| `STATIC_ROOT` | `staticfiles` |
| `WEB_CONCURRENCY` | gunicorn worker count, e.g. `3` |

Generate a fresh `SECRET_KEY` for production — never reuse the local dev value.
