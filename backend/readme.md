<div align="center">

# ⚙️ BusBooking — Backend API

[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-FB015B?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

**RESTful API powering the BusBooking platform — built with Flask, SQLAlchemy & MySQL.**

</div>

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Server](#-running-the-server)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Key Implementation Details](#-key-implementation-details)
- [Troubleshooting](#-troubleshooting)

---

## 📦 Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | ≥ 3.10 |
| pip | ≥ 22.0 |
| MySQL Server | ≥ 8.0 |
| Git | ≥ 2.x |

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/Karthi-Villain/BusBookingSystem.git
cd BusBookingSystem/backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# macOS / Linux:
source venv/bin/activate
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt
```

### Dependencies (`requirements.txt`)

```
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-JWT-Extended==4.6.0
Flask-Mail==0.9.1
Flask-CORS==4.0.0
PyMySQL==1.1.0
razorpay==1.4.1
python-dotenv==1.0.0
Werkzeug==3.0.1
```

---

## 🗄️ Database Setup

```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Create the database
CREATE DATABASE busbooking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. Exit MySQL
EXIT;

# 4. Initialize tables (Flask auto-creates via SQLAlchemy)
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('✅ Tables created')"
```

### Schema Overview

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  users   │    │  routes  │    │route_stops│
│──────────│    │──────────│    │──────────-│
│ id (PK)  │    │ id (PK)  │◄───│ route_id  │
│ name     │    │ origin   │    │ stop_name │
│ email    │    │ dest     │    │ stop_order│
│ pass_hash│    │ distance │    │ km_from.. │
│ gender   │    └────┬─────┘    └───────────┘
│ role     │         │
└────┬─────┘    ┌────▼─────┐
     │          │  buses   │
     │          │──────────│
     │          │ id (PK)  │
     │          │ route_id │
     │          │ name     │
     │          │ bus_type │
     │          │ price/km │
     │          └────┬─────┘
     │               │
     │          ┌────▼─────┐    ┌───────────┐
     │          │  seats   │    │passengers │
     │          │──────────│    │───────────│
     │          │ id (PK)  │◄───│ seat_id   │
     │          │ bus_id   │    │ booking_id│
     │          │ seat_no  │    │ name      │
     │          │ is_booked│    │ age       │
     │          └──────────┘    │ gender    │
     │                          └─────┬─────┘
     │          ┌─────────────────────┘
     │     ┌────▼──────┐
     └────►│ bookings  │
           │───────────│
           │ id (PK)   │
           │ user_id   │
           │ bus_id    │
           │ total_amt │
           │ status    │
           │ razorpay  │
           └───────────┘
```

---

## ▶️ Running the Server

```bash
# Development mode (with auto-reload)
flask run --port 5000 --debug

# Or directly with Python
python app.py
```

The API will be available at **`http://localhost:5000`**

### Verify it's running:

```bash
curl http://localhost:5000/api/health
# Expected: {"status": "ok", "message": "BusBooking API is running"}
```

---

## 📡 API Endpoints

### 🔐 Authentication

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "gender": "male"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
# Returns: { "access_token": "eyJhbG..." }
```

### 🗺️ Routes & Buses

```http
GET /api/routes/search?from=Chennai&to=Bangalore&date=2025-01-15

GET /api/buses/{bus_id}/seats
Authorization: Bearer <token>
```

### 📝 Bookings

```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "bus_id": 1,
  "boarding_point": "Chennai Central",
  "dropping_point": "Bangalore Majestic",
  "passengers": [
    { "seat_id": 5, "name": "John", "age": 28, "gender": "male" }
  ]
}
```

### 💳 Payments

```http
POST /api/payment/create-order
Authorization: Bearer <token>
{ "booking_id": 42 }

POST /api/payment/verify
Authorization: Bearer <token>
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "sig_xxx"
}
```

---

## 📂 Project Structure

```
backend/
├── app.py                 # Application entry point & factory
├── config.py              # Configuration loader (reads .env)
├── models.py              # SQLAlchemy ORM models
│   ├── User               # Auth & profile
│   ├── Route              # Origin-destination pairs
│   ├── RouteStop           # Intermediate stops
│   ├── Bus                # Bus details & pricing
│   ├── Seat               # Seat map & status
│   ├── Booking            # Reservation records
│   └── Passenger          # Traveller details
├── routes.py              # All API endpoint handlers
├── requirements.txt       # Python dependencies
├── .env.example           # Environment variable template
└── .gitignore
```

---

## 🔑 Key Implementation Details

### Lazy Seat Generation
Seats are created on first request via `get_or_create_seats()` — no manual seeding required.

### Gender-Based Seating Rules
`apply_gender_rules()` enforces adjacency policies: a female passenger won't be placed next to a male stranger.

### Payment Flow
1. Client calls `/payment/create-order` → Razorpay order created
2. Client completes payment via Razorpay checkout
3. Client sends signature to `/payment/verify` → server verifies HMAC
4. Booking status updated to `confirmed`

### Async Email Notifications
Booking confirmations are dispatched asynchronously using Python `threading` to avoid blocking the response.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError` | Ensure venv is activated: `source venv/bin/activate` |
| `Access denied for user` | Check `DB_USER` and `DB_PASSWORD` in `.env` |
| `Can't connect to MySQL` | Verify MySQL is running: `sudo systemctl status mysql` |
| CORS errors | Ensure `Flask-CORS` is installed and `CORS(app)` is called |
| JWT token expired | Default expiry is 24h — re-login to get a fresh token |

---

<div align="center">

**🔧 Backend crafted with Flask & ❤️**

</div>
