# 🪪 National ID System

A full-stack web application for managing national identity card applications. Citizens can register, apply for a national ID, track their application status, and manage their profile — all through a clean, modern interface.

---

## 🗂️ Project Structure

```
national_id_system/
├── backend/                        # Django REST Framework API
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3
│   ├── backend/                    # Project config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── core/                       # Main application
│       ├── models.py
│       ├── serializers.py
│       ├── viewsets.py
│       ├── urls.py
│       └── migrations/
└── frontend/                       # React + Vite SPA
    ├── index.html
    └── src/
        ├── App.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   └── PrivateRoute.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── ApplyId.jsx
        │   ├── ApplicationStatus.jsx
        │   └── Profile.jsx
        └── services/
            └── api.js
```

---

## ✨ Features

- **Authentication** — Secure login with token-based auth; protected routes via `PrivateRoute`
- **ID Application** — Citizens submit applications with personal details through a guided form
- **Application Tracking** — Real-time status updates (Pending → Under Review → Approved/Rejected)
- **Profile Management** — View and update personal information
- **Admin Panel** — Django admin interface for reviewing and processing applications

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Python, Django, Django REST Framework   |
| Database  | SQLite (dev) — swappable to PostgreSQL  |
| Frontend  | React 18, Vite, JSX                     |
| Styling   | CSS (custom, `src/styles/main.css`)     |
| API Comm. | Axios / Fetch (`services/api.js`)       |

---

## ⚙️ Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

---

### 🔧 Backend Setup

```bash
# 1. Navigate to the backend directory
cd national_id_system/backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Apply database migrations
python manage.py migrate

# 5. Create a superuser (for admin access)
python manage.py createsuperuser

# 6. Start the development server
python manage.py runserver
```

The API will be available at `http://localhost:8000`  
Django Admin: `http://localhost:8000/admin`

---

### 🎨 Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd national_id_system/frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔌 API Overview

All endpoints are prefixed with `/api/`.

| Method | Endpoint                  | Description                        | Auth Required |
|--------|---------------------------|------------------------------------|---------------|
| POST   | `/api/auth/login/`        | Obtain auth token                  | No            |
| POST   | `/api/auth/register/`     | Register a new user                | No            |
| GET    | `/api/applications/`      | List user's applications           | Yes           |
| POST   | `/api/applications/`      | Submit a new ID application        | Yes           |
| GET    | `/api/applications/{id}/` | Retrieve application status        | Yes           |
| GET    | `/api/profile/`           | Get current user profile           | Yes           |
| PATCH  | `/api/profile/`           | Update user profile                | Yes           |

> Full API documentation is accessible at `http://localhost:8000/api/` when the backend is running (DRF Browsable API).

---

## 🗄️ Core Models (`core/models.py`)

- **User** — Extended Django user with citizen-specific fields
- **Application** — ID application record with status tracking, personal details, and timestamps
- **Profile** — Citizen profile linked one-to-one with the user

---

## 🔐 Authentication

The frontend stores the auth token (returned on login) and attaches it as a Bearer token to all subsequent API requests via `services/api.js`. Unauthenticated users attempting to access protected pages are redirected to `/login` by the `PrivateRoute` component.

---

## 🚀 Deployment Notes

1. **Database** — Switch `db.sqlite3` to PostgreSQL in `settings.py` for production
2. **Environment variables** — Move `SECRET_KEY`, `DEBUG`, and DB credentials to a `.env` file using `python-decouple` or `django-environ`
3. **Static files** — Run `python manage.py collectstatic` and serve via Nginx or WhiteNoise
4. **Frontend build** — Run `npm run build` and serve the `dist/` folder

---

## 📄 License

This project is licensed under the MIT License.