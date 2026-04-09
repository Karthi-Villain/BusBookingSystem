import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Helper function to check localStorage
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
    // 1. Check session on component mount
    checkAuth();

    // 2. Listen for custom login/logout events from other components
    window.addEventListener('authStateChange', checkAuth);

    // 3. Handle closing the dropdown when clicking outside of it
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('authStateChange', checkAuth);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear all session data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    // Close dropdown
    setIsDropdownOpen(false);
    
    // Dispatch the custom event to update Navbar state instantly
    window.dispatchEvent(new Event('authStateChange'));
    
    // Redirect to home page
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-red-600">
        BusBooking
      </Link>
      <div className="space-x-6 flex items-center">
        <Link to="/my-bookings" className="text-gray-600 hover:text-red-600 font-medium transition-colors">
          My Bookings
        </Link>
        
        {isLoggedIn ? (
          // Logged In State: User Dropdown Menu
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium transition-all hover:bg-red-100"
            >
              <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span>Hi! {userName}</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {/* Dropdown Content */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm text-gray-500">Logged in as</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{userName}</p>
                </div>
                <Link 
                  to="/my-profile" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                >
                  My Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors border-t border-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          // Logged Out State: Standard Button
          <Link 
            to="/login" 
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            Login / Account
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;