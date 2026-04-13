import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Buses from "./pages/Buses";
import Seats from "./pages/Seats";
import MyBookings from "./pages/MyBookings";
import AuthPage from "./pages/AuthPage";
import MyProfile from './pages/MyProfile';
import Payment from './pages/Payment';
import AboutProject from './pages/AboutProject';
import Tracking from './pages/Tracking';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/buses" element={<Buses />} />
            <Route path="/bus/:id/seats" element={<Seats />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/about-project" element={<AboutProject />} />
            <Route path="/tracking" element={<Tracking />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;