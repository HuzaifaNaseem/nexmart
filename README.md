# NEXMART — Premium E-Commerce Platform

Full-stack e-commerce application: React storefront, FastAPI backend, PostgreSQL database.

## Features

- 🛍️ Product catalog with search, filters, sorting, comparison, and quick view
- 🛒 Cart, wishlist, multi-step checkout with order tracking
- ⭐ Verified-purchase reviews with rating distribution
- 🎁 Loyalty points, promo codes, personalized recommendations
- 👤 JWT authentication (access + refresh tokens), rate-limited auth endpoints
- 📊 Admin dashboard: revenue stats, order management, product CRUD
- 🌙 Dark mode, multi-currency display, responsive design

## Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS (`nexmart/`)         |
| Backend   | FastAPI, SQLAlchemy 2 (async), Pydantic v2 (`nexmart-api/`) |
| Database  | PostgreSQL (asyncpg), Alembic migrations          |
| Auth      | JWT (python-jose), bcrypt password hashing        |

## Local development

### Prerequisites
Node 18+, Python 3.13+, PostgreSQL 15+.

### Backend

```bash
cd nexmart-api
python -m venv .venv
.venv/Scripts/activate        # Windows — use source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env          # then edit DATABASE_URL and set a strong SECRET_KEY
uvicorn app.main:app --port 8001 --reload
```

API docs: http://localhost:8001/docs

### Frontend

```bash
cd nexmart
npm install
npm run dev
```

App: http://localhost:5173

### Seed demo data

```bash
cd nexmart-api
NEXMART_ADMIN_PASSWORD=<choose-a-password> python -m scripts.seed_products
# then grant admin: UPDATE users SET is_admin = true WHERE email = 'admin@nexmart.com';
```

## Tests

75 integration tests cover authentication, catalog, cart, checkout, reviews,
wishlist, admin access control, and rate limiting. They exercise the real ASGI
app and a real PostgreSQL schema — no mocks.

```bash
cd nexmart-api
pip install -r requirements-dev.txt
createdb nexmart_test          # once
pytest                          # or: pytest -v
```

Tests run against a dedicated `nexmart_test` database, derived from your `.env`
credentials (override with `TEST_DATABASE_URL`). The suite refuses to start if
the target database name does not contain `test`, since it drops the schema
between runs.

## Deployment

The repo is wired for a free-tier production stack:

| Piece      | Service | Config |
|------------|---------|--------|
| Database   | [Neon](https://neon.tech) | Create a project, copy the connection string |
| API        | [Render](https://render.com) | `render.yaml` blueprint (set `DATABASE_URL` + `FRONTEND_URL`) |
| Frontend   | [Vercel](https://vercel.com) | Root directory `nexmart`, env var `VITE_API_URL` = Render URL |

Deploy order: Neon → Render → Vercel, then set `FRONTEND_URL` on Render to the Vercel URL so CORS allows the browser.

## Environment variables

### API (`nexmart-api/.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon/Heroku-style URLs are auto-normalized) |
| `SECRET_KEY` | JWT signing key — generate with `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `FRONTEND_URL` | Allowed CORS origin |
| `DEBUG` | `False` in production (placeholder SECRET_KEY is rejected when off) |

### Frontend (`nexmart/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API base URL (defaults to `http://localhost:8001`) |
