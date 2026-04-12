import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Ticket, LogOut, 
  ShieldCheck, Fingerprint, Camera, Edit3
} from 'lucide-react';
import Chatbot from "../components/Chatbot";

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
    window.dispatchEvent(new Event('authStateChange')); // Updates Navbar instantly
    navigate('/'); // Smooth SPA routing instead of hard reload
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans selection:bg-red-600 selection:text-white">
      
      {/* Premium Header / Hero */}
      <div className="bg-slate-950 pt-16 pb-24 px-6 relative overflow-hidden rounded-b-[3rem] shadow-xl">
        <div className="absolute top-[-50%] right-[-10%] w-[40rem] h-[40rem] bg-red-600/20 rounded-full mix-blend-screen filter blur-[80px] opacity-70"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-red-400 text-xs font-bold mb-4 tracking-wide uppercase">
            <ShieldCheck size={14} /> Secure Account
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            My <span className="text-red-500">Profile.</span>
          </h1>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-20">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          
          {/* LEFT: Sidebar / Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full md:w-1/3 flex-shrink-0"
          >
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 overflow-hidden relative">
              {/* Top Banner inside card */}
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-red-50 to-white"></div>
              
              <div className="flex flex-col items-center pb-6 border-b border-slate-100 mb-4 relative z-10">
                {/* Avatar with Glow & Fake Camera Button */}
                <div className="relative group mb-4">
                  <div className="absolute inset-0 bg-red-600 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="w-28 h-28 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-full flex items-center justify-center text-4xl font-black shadow-lg relative z-10 border-4 border-white">
                    {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-red-600 transition-colors z-20 cursor-pointer">
                    <Camera size={14} />
                  </button>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{userData.name}</h2>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mt-2 flex items-center gap-1.5 border border-emerald-100 uppercase tracking-wider">
                  <ShieldCheck size={14} /> Verified Traveler
                </span>
              </div>
              
              <nav className="flex flex-col gap-2 text-sm font-bold relative z-10">
                <button className="flex items-center gap-3 text-red-600 bg-red-50 px-5 py-3.5 rounded-2xl transition-all shadow-sm shadow-red-500/10">
                  <User size={18} /> Personal Info
                </button>
                <button 
                  onClick={() => navigate('/my-bookings')} 
                  className="flex items-center gap-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-5 py-3.5 rounded-2xl transition-colors group"
                >
                  <Ticket size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" /> My Bookings
                </button>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50 px-5 py-3.5 rounded-2xl transition-colors mt-4 border border-transparent hover:border-red-100 group"
                >
                  <LogOut size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" /> Sign Out
                </button>
              </nav>
            </div>
          </motion.div>

          {/* RIGHT: Main Content Area */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full md:w-2/3"
          >
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-10">
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Personal Information</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Manage your basic account details.</p>
                </div>
                <button className="flex items-center gap-2 text-sm bg-slate-50 text-slate-600 font-bold px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-100 hover:border-red-100 shadow-sm">
                  <Edit3 size={16} /> <span className="hidden sm:block">Edit Details</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name Field */}
                <motion.div variants={itemVariants} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <User size={14} className="text-slate-300 group-hover:text-red-400 transition-colors" /> Full Name
                  </label>
                  <div className="text-slate-900 font-bold text-lg">{userData.name}</div>
                </motion.div>

                {/* Email Field */}
                <motion.div variants={itemVariants} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <Mail size={14} className="text-slate-300 group-hover:text-red-400 transition-colors" /> Email Address
                  </label>
                  <div className="text-slate-900 font-bold text-lg truncate" title={userData.email}>{userData.email}</div>
                </motion.div>

                {/* User ID Field */}
                <motion.div variants={itemVariants} className="border border-slate-100 rounded-2xl p-6 bg-slate-900 md:col-span-2 relative overflow-hidden group">
                  {/* Decorative faint icon */}
                  <Fingerprint size={120} className="absolute -right-6 -bottom-6 text-slate-800 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                  
                  <div className="relative z-10">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      <Fingerprint size={14} className="text-red-500" /> Account ID
                    </label>
                    <div className="text-white font-mono font-black text-xl tracking-wider mb-2">
                      {userData.userId.substring(0, 15)}{userData.userId.length > 15 ? '...' : ''}
                    </div>
                    <p className="text-xs text-slate-400 font-medium max-w-sm">
                      Provide this unique identifier to customer support if you need assistance with your secure bookings.
                    </p>
                  </div>
                </motion.div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default MyProfile;