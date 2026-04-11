<div align="center">

# 🚌 BusBooking — Online Bus Reservation System

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0066FF?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A full-stack bus ticket reservation platform with real-time seat selection, gender-based seating rules, and integrated payment processing.**

[Features](#-features) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack) · [Screenshots](#-screenshots) · [Getting Started](#-getting-started) · [API Reference](#-api-reference)

---

</div>

## 📸 Screenshots

<div align="center">
<table>
<tr>
<td><img src="assets/image1.png" alt="Home Page" width="400"/></td>
<td><img src="assets/image2.png" alt="Bus Selection" width="400"/></td>
</tr>
<tr>
<td align="center"><b>🏠 Home — Route Search</b></td>
<td align="center"><b>💺 Bus Selection</b></td>
</tr>
<tr>
<td><img src="assets/image3.png" alt="Seats Selection" width="400"/></td>
<td><img src="assets/image4.png" alt="View/Download Bookings" width="400"/></td>
</tr>
<tr>
<td align="center"><b>🏠 Home — Route Search</b></td>
<td align="center"><b>💺 Interactive Seat Selection</b></td>
</tr>
</table>
</div>

---

## ✨ Features

| Category | Feature |
|----------|---------|
| 🔐 **Auth** | JWT-based signup/login with role-based access (admin, user) |
| 🗺️ **Routes** | Multi-stop route search with origin ↔ destination filtering |
| 💺 **Seats** | Real-time seat map with gender-based adjacency rules |
| 💳 **Payments** | Razorpay integration with order verification & refund support |
| 📧 **Notifications** | Async email confirmations via Flask-Mail |
| 📱 **Responsive** | Mobile-first UI with Tailwind CSS & Framer Motion animations |
| 🛡️ **Security** | Password hashing (Werkzeug), CORS policies, input validation |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   CLIENT                        │
│  React 18 + Vite + Tailwind + Framer Motion     │
│  ┌──────┐ ┌──────┐ ┌───────┐ ┌────────┐        │
│  │ Home │ │Seats │ │Payment│ │Bookings│        │
│  └──┬───┘ └──┬───┘ └──┬────┘ └───┬────┘        │
│     │        │        │          │              │
│     └────────┴────────┴──────────┘              │
│                    │  Axios HTTP                │
├────────────────────┼────────────────────────────┤
│                    ▼                            │
│              FLASK REST API                     │
│  ┌──────────────────────────────────┐           │
│  │  JWT Auth Middleware             │           │
│  │  /api/auth  /api/routes          │           │
│  │  /api/buses  /api/bookings       │           │
│  │  /api/payment                    │           │
│  └──────────┬───────────────────────┘           │
│             │  SQLAlchemy ORM                   │
│             ▼                                   │
│  ┌──────────────────┐  ┌──────────────────┐     │
│  │   MySQL 8.0      │  │   Razorpay API   │     │
│  │   7 Tables       │  │   Payment GW     │     │
│  └──────────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | Component-based UI |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations & transitions |
| React Router v6 | Client-side routing |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|-----------|---------|
| Flask 3.x | REST API framework |
| SQLAlchemy | ORM & database abstraction |
| Flask-JWT-Extended | Token-based authentication |
| Flask-Mail | Email notifications |
| Razorpay SDK | Payment processing |
| Werkzeug | Password hashing |

### Database
| Technology | Purpose |
|-----------|---------|
| MySQL 8.0 | Relational data store |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x & **npm** ≥ 9.x
- **Python** ≥ 3.10
- **MySQL** ≥ 8.0

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Karthi-Villain/BusBookingSystem.git
cd BusBookingSystem

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Configure DB & API keys
flask run --port 5000

# 3. Frontend setup (new terminal)
cd frontend/bus-booking-ui
npm install
npm run dev                     # Opens at http://localhost:5173
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ✗ | User registration |
| `POST` | `/api/auth/login` | ✗ | User login → JWT |
| `GET` | `/api/routes/search` | ✗ | Search routes by origin/dest/date |
| `GET` | `/api/buses/<id>/seats` | ✓ | Fetch seat map for a bus |
| `POST` | `/api/bookings` | ✓ | Create booking with passenger details |
| `POST` | `/api/payment/create-order` | ✓ | Initiate Razorpay order |
| `POST` | `/api/payment/verify` | ✓ | Verify payment signature |
| `GET` | `/api/bookings/my` | ✓ | Fetch user's booking history |

---

## 📂 Project Structure

```
busbooking/
├── backend/
│   ├── models.py          # SQLAlchemy models (7 tables)
│   ├── routes.py          # Flask API endpoints
│   ├── config.py          # App configuration
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment template
├── frontend/
│   ├── src/
│   │   ├── pages/         # Home, Seats, Payment, MyBookings, Auth
│   │   ├── components/    # Reusable UI components
│   │   └── App.jsx        # Root component & routing
│   ├── package.json
│   └── vite.config.js
└── README.md              # ← You are here
```

---

## 🗄️ Database Schema

```sql
users          → id, name, email, password_hash, gender, role
routes         → id, origin, destination, distance_km
route_stops    → id, route_id, stop_name, stop_order, km_from_origin
buses          → id, route_id, name, bus_type, departure_time, price_per_km
seats          → id, bus_id, seat_number, seat_type, deck, is_booked, gender
bookings       → id, user_id, bus_id, total_amount, status, razorpay_order_id
passengers     → id, booking_id, seat_id, name, age, gender
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">

**Built with ❤️ using React & Flask**

</div>
