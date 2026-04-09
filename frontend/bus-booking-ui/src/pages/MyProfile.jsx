import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    userId: ''
  });

  useEffect(() => {
    // Fetch user details from localStorage
    const token = localStorage.getItem('authToken');
    
    // If no token, kick them back to login
    if (!token) {
      navigate('/login');
      return;
    }

    setUserData({
      name: localStorage.getItem('userName') || 'Traveler',
      email: localStorage.getItem('userEmail') || 'Not provided',
      userId: localStorage.getItem('userId') || 'Unknown'
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); // Clears all user data
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Sidebar / Quick Actions */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col items-center pb-6 border-b border-gray-100 mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-lg mb-4">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold">{userData.name}</h2>
                <span className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Traveler
                </span>
              </div>
              
              <nav className="flex flex-col gap-2 text-sm font-medium">
                <button className="flex items-center gap-3 text-red-600 bg-red-50 px-4 py-3 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Personal Info
                </button>
                <button onClick={() => navigate('/my-bookings')} className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  My Bookings
                </button>
                <button onClick={handleLogout} className="flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg transition-colors mt-4 border-t border-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Personal Information</h3>
                <button className="text-sm text-red-600 font-medium hover:underline">Edit</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name Field */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                  <div className="text-gray-900 font-medium">{userData.name}</div>
                </div>

                {/* Email Field */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="text-gray-900 font-medium">{userData.email}</div>
                </div>

                {/* User ID Field */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Account ID</label>
                  <div className="text-gray-900 font-medium font-mono text-sm">#{userData.userId}</div>
                  <p className="text-xs text-gray-400 mt-2">Provide this ID to customer support if you need assistance with your bookings.</p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyProfile;