<div align="center">

# 🎨 BusBooking — Frontend

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.x-E91E63?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

**A modern, responsive bus booking UI built with React 18, Vite, Tailwind CSS & Framer Motion.**

</div>

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Build & Preview](#-build--preview)
- [Project Structure](#-project-structure)
- [Pages Overview](#-pages-overview)
- [Configuration](#-configuration)
- [Customization](#-customization)
- [Troubleshooting](#-troubleshooting)

---

## 📦 Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| Git | ≥ 2.x |

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/Karthi-Villain/BusBookingSystem.git
cd BusBookingSystem/frontend/bus-booking-ui

# Install dependencies
npm install
```

---

## 💻 Development

```bash
# Start development server with HMR
npm run dev

# Server starts at http://localhost:5173
# Hot Module Replacement enabled — changes reflect instantly
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

---

## 🏗️ Build & Preview

```bash
# Create optimized production build
npm run build

# Preview the production build locally
npm run preview
# Opens at http://localhost:4173
```

### Build Output

```
dist/
├── index.html          # Entry point
├── assets/
│   ├── index-[hash].js    # Bundled JS (~180KB gzipped)
│   └── index-[hash].css   # Bundled CSS (~25KB gzipped)
└── ...
```

---

## 📂 Project Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/             # Static images & icons
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx      # Navigation bar
│   │   ├── Footer.jsx      # Site footer
│   ├── pages/
│   │   ├── Home.jsx        # 🏠 Route search & hero section
│   │   ├── AuthPage.jsx    # 🔐 Login / Register forms
│   │   ├── Buses.jsx       # 🚌 Bus listing & filters
│   │   ├── Seats.jsx       # 💺 Seat selection interface
│   │   ├── Payment.jsx     # 💳 Razorpay checkout
│   │   └── MyBookings.jsx  # 📋 Booking history
│   ├── App.jsx             # Root component & router
│   ├── main.jsx            # Entry point (React DOM)
│   └── index.css           # Tailwind directives & globals
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind theme & plugins
├── postcss.config.js       # PostCSS plugins
├── package.json
└── .gitignore
```

---

## 📄 Pages Overview

### 🏠 Home (`Home.jsx`)
- Hero section with animated search form
- Origin ↔ Destination dropdowns with swap button
- Date picker with calendar integration
- Popular routes showcase with Framer Motion stagger animations

### 🔐 Auth (`AuthPage.jsx`)
- Toggle between Login & Register modes
- Form validation with error feedback
- JWT token stored in `localStorage`
- Redirect to previous page after login

### 🚌 Buses (`Buses.jsx`)
- Dynamic bus listing from search results
- Filter by bus type (Sleeper / Seater / AC / Non-AC)
- Displays departure time, duration, price
- Animated card transitions

### 💺 Seats (`Seats.jsx`)
- Interactive seat map (upper & lower deck)
- Color-coded: 🟢 Available · 🔴 Booked · 🔵 Selected · 🟡 Female
- Gender-based seating rule indicators
- Real-time fare calculation as seats are selected
- Passenger details form per seat

### 💳 Payment (`Payment.jsx`)
- Booking summary with itemized pricing
- Razorpay checkout integration
- Payment success/failure handling
- Auto-redirect to booking confirmation

### 📋 My Bookings (`MyBookings.jsx`)
- Booking history with status badges (Confirmed / Pending / Cancelled)
- Expandable booking details
- Download ticket / Cancel booking actions

---

## ⚙️ Configuration

### Environment Variables

Create `.env` in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

> All env vars must be prefixed with `VITE_` to be accessible in the app.

### Vite Config (`vite.config.js`)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

---

## 🎨 Customization

### Tailwind Theme (`tailwind.config.js`)

```js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',    // Blue 800
        secondary: '#F59E0B',  // Amber 500
        accent: '#10B981',     // Emerald 500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### Adding New Pages

1. Create `src/pages/NewPage.jsx`
2. Add route in `App.jsx`:
   ```jsx
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add nav link in `Navbar.jsx`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm run dev` fails | Delete `node_modules` & `package-lock.json`, then `npm install` |
| Blank page on load | Check browser console for errors; ensure API URL is correct |
| CORS errors | Verify Vite proxy config or backend CORS settings |
| Styles not loading | Ensure Tailwind directives are in `index.css` |
| HMR not working | Try `--force` flag: `npm run dev -- --force` |
| Build fails | Run `npx tsc --noEmit` to check for TypeScript/JSX errors |

---

## 📱 Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome 90+ | ✅ |
| Firefox 88+ | ✅ |
| Safari 14+ | ✅ |
| Edge 90+ | ✅ |
| Mobile Chrome | ✅ |
| Mobile Safari | ✅ |

---

<div align="center">

**🎨 Frontend crafted with React & ❤️**

</div>
