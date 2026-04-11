import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Ticket, User, LogOut, ChevronDown, 
  FileText, BusFront, Settings
} from "lucide-react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const storedName = localStorage.getItem('userName') || "Traveler"; 

    if (token) {
      setIsLoggedIn(true);
      setUserName(storedName);
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('authStateChange', checkAuth);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener('authStateChange', checkAuth);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    setIsDropdownOpen(false);
    window.dispatchEvent(new Event('authStateChange'));
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-100 py-4 px-6 flex justify-between items-center transition-all duration-300">
      
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-red-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-red-600/20">
          <BusFront size={24} />
        </div>
        <span className="text-2xl font-black text-slate-900 tracking-tight">
          Bus<span className="text-red-600">Booking</span>
        </span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center space-x-2 md:space-x-4 text-sm font-bold text-slate-600">
        
        {/* NEW: About Project Button */}
        <Link 
          to="/about-project" 
          className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-red-600 transition-colors"
        >
          <FileText size={16} className="text-slate-400" />
          About Project
        </Link>

        {/* My Bookings */}
        <Link 
          to="/my-bookings" 
          className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-red-600 transition-colors"
        >
          <Ticket size={16} className="text-slate-400" />
          My Bookings
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block"></div>
        
        {/* Auth State */}
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-slate-50 text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 group"
            >
              <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-105 transition-transform">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block">Hi! {userName}</span>
              <ChevronDown 
                size={16} 
                className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-red-600' : ''}`} 
              />
            </button>

            {/* Dropdown Content with Framer Motion */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] overflow-hidden z-50 origin-top-right"
                >
                  <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Logged in as</p>
                    <p className="text-sm font-black text-slate-900 truncate">{userName}</p>
                  </div>
                  
                  <div className="py-2">
                    <Link 
                      to="/my-bookings" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="md:hidden flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
                    >
                      <Ticket size={16} className="text-slate-400" /> My Bookings
                    </Link>
                    <Link 
                      to="/about-project" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="md:hidden flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
                    >
                      <FileText size={16} className="text-slate-400" /> About Project
                    </Link>
                    <Link 
                      to="/my-profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
                    >
                      <Settings size={16} className="text-slate-400" /> Account Settings
                    </Link>
                  </div>

                  <div className="p-2 border-t border-slate-50">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors"
                    >
                      <LogOut size={16} /> Logout Securely
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="flex items-center gap-2 bg-red-600 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-md shadow-red-600/20 hover:shadow-slate-900/20 group"
          >
            <User size={18} className="group-hover:scale-110 transition-transform"/> 
            <span>Login / Account</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;