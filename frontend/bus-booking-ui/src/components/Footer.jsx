import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BusFront, Heart, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  // Check initial login state
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));

  useEffect(() => {
    // Handler to update state when auth changes
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem('authToken'));
    };

    // Listen to custom event fired by AuthPage.jsx and Navbar logout
    window.addEventListener('authStateChange', handleAuthChange);
    // Listen to cross-tab storage changes
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 relative mt-auto overflow-hidden border-t border-slate-900">
      
      {/* Moving Bus Animation Layer */}
      <div className="absolute top-0 left-0 w-full h-2 bg-slate-900">
        <div className="w-full h-full border-t border-dashed border-slate-700/50"></div>
      </div>
      <motion.div 
        animate={{ x: ["-10vw", "110vw"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-14px] left-0 text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]"
      >
        <BusFront size={28} />
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800/50 pb-12">
          
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-red-600 text-white p-1.5 rounded-lg shadow-lg shadow-red-600/20">
                <BusFront size={24} />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Bus<span className="text-red-600">Booking</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-6">
              Experience the fastest, safest, and most premium way to book your bus tickets online. We partner with top-rated travel operators to ensure your journey is comfortable and secure.
            </p>
            <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold bg-emerald-500/10 w-max px-3 py-1.5 rounded-full border border-emerald-500/20">
              <ShieldCheck size={16} /> 100% Secure Payments
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Quick Links</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/" className="hover:text-red-500 transition-colors flex items-center gap-2"><span className="text-red-500/50">›</span> Home</Link></li>
              <li><Link to="/my-bookings" className="hover:text-red-500 transition-colors flex items-center gap-2"><span className="text-red-500/50">›</span> My Bookings</Link></li>
              <li><Link to="/about-project" className="hover:text-red-500 transition-colors flex items-center gap-2"><span className="text-red-500/50">›</span> About Project</Link></li>
              
              {/* Conditionally render the Login link */}
              {!isLoggedIn && (
                <li><Link to="/auth" className="hover:text-red-500 transition-colors flex items-center gap-2"><span className="text-red-500/50">›</span> Login / Register</Link></li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Contact Us</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-red-500 shrink-0" />
                <span>Nanakramguda,<br/>Hyderabad, TS 500032</span>
              </li>
              <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                <Phone size={18} className="text-red-500 shrink-0" />
                <span>+91 987xx xxxxx</span>
              </li>
              <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                <Mail size={18} className="text-red-500 shrink-0" />
                <span>support@bomain.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>&copy; {new Date().getFullYear()} BusBooking Inc. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            Designed with <Heart size={14} className="text-red-500 fill-red-500" /> for travelers.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;