import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Ticket, MapPin, Calendar, Download, XCircle, ArrowRight, 
  User, Armchair, AlertCircle, History, Map, Clock 
} from "lucide-react";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const ticketRefs = useRef({});

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.post("/my-bookings"); 

        const serverResponse = response.data; 
        const actualArray = serverResponse?.data || []; 

        setBookings(Array.isArray(actualArray) ? actualArray : []);

      } catch (err) {
        console.error("API Error:", err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch bookings.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleDownload = async (key) => {
    const input = ticketRefs.current[key];
    if (!input) return;

    input.style.backgroundColor = "#ffffff";

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    
    input.style.backgroundColor = "";

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`Ticket_${key}.pdf`);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // CORRECTED LOGIC: Add 1 day to the date, check dropping time + 30 mins
  const isJourneyValid = (bookingDateStr, droppingTimeStr) => {
    if (!bookingDateStr || !droppingTimeStr) return true; // Default to valid if data is missing
    
    const journeyDate = new Date(bookingDateStr);
    
    journeyDate.setDate(journeyDate.getDate() + 1);
    
    const [hours, minutes] = droppingTimeStr.split(':').map(Number);
    
    journeyDate.setHours(hours || 0, minutes || 0, 0, 0);

    const expiryTime = new Date(journeyDate.getTime() + 30 * 60000);
    const now = new Date();

    return now <= expiryTime;
  };

  // Split bookings into Active and Past based on the corrected logic
  const activeBookings = bookings.filter(b => isJourneyValid(b.date, b.droppingTime));
  const pastBookings = bookings.filter(b => !isJourneyValid(b.date, b.droppingTime));

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">Retrieving your journeys...</h3>
        <p className="text-sm text-slate-500">Please wait while we fetch your tickets.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-red-600 selection:text-white pb-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3 flex items-center gap-3">
              <Ticket className="text-red-600" size={40} /> My Bookings
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl">View, download, and manage all your upcoming and past journeys in one place.</p>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-100 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-red-800 font-bold text-lg mb-0.5">Unable to load bookings</h3>
                <p className="text-red-600/80 text-sm">{error}</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-red-600/20 whitespace-nowrap"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty State (No Bookings at all) */}
        {!isLoading && !error && bookings.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center flex flex-col items-center max-w-2xl mx-auto mt-10"
          >
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
               <Ticket className="w-16 h-16 text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-3">No journeys yet</h3>
            <p className="text-slate-500 text-lg mb-10 max-w-md leading-relaxed">
              Looks like you haven't booked any trips. Discover amazing destinations and plan your next adventure today!
            </p>
            <Link to="/" className="bg-red-600 hover:bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-red-600/30 hover:shadow-slate-900/30 transition-all duration-300 transform hover:-translate-y-1 text-lg flex items-center gap-2">
              Book a Bus <ArrowRight size={20} />
            </Link>
          </motion.div>
        )}

        {/* =========================================
            SECTION: ACTIVE / UPCOMING BOOKINGS 
            ========================================= */}
        {activeBookings.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span> Upcoming Journeys
            </h2>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {activeBookings.map((booking, index) => {
                  const safeKey = booking.pnr || booking._id || booking.id || `active-${index}`;

                  return (
                    <motion.div 
                      layout
                      variants={itemVariants}
                      key={safeKey} 
                      className="group relative flex flex-col drop-shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:drop-shadow-[0_20px_40px_rgb(220,38,38,0.1)] transition-all duration-500"
                    >
                      {/* === PRINTABLE TICKET AREA === */}
                      <div 
                        ref={(el) => (ticketRefs.current[safeKey] = el)}
                        className="bg-white rounded-3xl overflow-hidden flex flex-col relative z-10 border border-slate-100"
                      >
                        {/* Brand Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white flex justify-between items-center relative">
                          <div>
                            <p className="text-red-200 text-[10px] font-bold uppercase tracking-widest mb-1">PNR Number</p>
                            <p className="text-2xl font-black tracking-wider text-white">{booking.pnr || "PENDING"}</p>
                          </div>
                          
                          {/* Live Tracking Button */}
                          <div className="flex flex-col items-end gap-2">
                            <span className="bg-white/20 text-white border border-white/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> Confirmed
                            </span>
                            <button className="bg-emerald-500 hover:bg-emerald-400 text-white text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-colors">
                              <Map size={12} /> Track Bus
                            </button>
                          </div>
                        </div>

                        {/* Ticket Details Body */}
                        <div className="p-6 md:p-8 relative bg-white">
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#f8fafc] rounded-full border-r border-slate-100 shadow-inner z-20 hidden md:block"></div>
                          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#f8fafc] rounded-full border-l border-slate-100 shadow-inner z-20 hidden md:block"></div>

                          <div className="flex justify-between items-center mb-8 relative">
                            <div className="absolute top-1/2 left-[20%] right-[20%] -translate-y-1/2 h-[2px] bg-slate-100 border-t-2 border-dashed border-slate-200 z-0"></div>

                            <div className="flex-1 z-10 bg-white pr-2">
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <MapPin size={12} className="text-red-500"/> From
                              </p>
                              <p className="text-2xl font-black text-slate-900">{booking.source}</p>
                            </div>
                            
                            <div className="z-10 bg-white px-3 flex flex-col items-center justify-center">
                               <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-sm group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                                 <ArrowRight size={20} />
                               </div>
                            </div>

                            <div className="flex-1 text-right z-10 bg-white pl-2">
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-end gap-1">
                                <MapPin size={12} className="text-slate-400"/> To
                              </p>
                              <p className="text-2xl font-black text-slate-900">{booking.destination}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-end pb-8 border-b-2 border-dashed border-slate-100">
                            <div>
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Calendar size={12}/> Journey Date & Time
                              </p>
                              <p className="text-lg font-extrabold text-slate-800">
                                {formatDate(booking.date)} <span className="text-red-600 ml-2">{booking.boardingTime || ""}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Fare</p>
                              <p className="text-3xl font-black text-red-600 leading-none">₹{booking.amount || 0}</p>
                            </div>
                          </div>

                          {/* Passenger Details Area */}
                          <div className="pt-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <User size={14} /> Passenger Details ({(booking.passengers || []).length})
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(booking.passengers || []).map((passenger, pIdx) => (
                                <div key={pIdx} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-black shadow-sm text-lg">
                                       {passenger.name ? passenger.name.charAt(0).toUpperCase() : "?"}
                                     </div>
                                     <div>
                                       <p className="font-bold text-slate-900 truncate max-w-[100px]">{passenger.name}</p>
                                       <p className="text-[11px] text-slate-500 font-semibold">{passenger.age} yrs • {passenger.gender === 'M' ? 'Male' : passenger.gender === 'F' ? 'Female' : 'Other'}</p>
                                     </div>
                                  </div>
                                  <div className="text-right flex flex-col items-end">
                                     <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5 font-bold">Seat</p>
                                     <p className="font-black text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                       <Armchair size={12} className="text-slate-400"/> {passenger.seatNo}
                                     </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* === END PRINTABLE TICKET AREA === */}

                      {/* Actions Bar (Download / Cancel) */}
                      <div className="bg-slate-900 rounded-b-3xl -mt-6 pt-6 px-6 py-4 flex justify-between items-center border border-slate-800 relative z-0 opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300">
                         <button 
                           onClick={() => handleDownload(safeKey)} 
                           className="flex items-center gap-2 text-sm font-bold text-white hover:text-red-400 transition-colors"
                         >
                           <Download size={16} /> Download PDF
                         </button>
                         <button className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-500 transition-colors">
                           <XCircle size={16} /> Cancel Ticket
                         </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* =========================================
            SECTION: PAST JOURNEYS (COMPACT LIST)
            ========================================= */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="text-xl font-extrabold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest pt-8 border-t border-slate-200">
              <History size={20} /> Past Journeys
            </h2>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="grid grid-cols-1 divide-y divide-slate-100">
                {pastBookings.map((booking, index) => {
                  const safeKey = booking.pnr || booking._id || booking.id || `past-${index}`;
                  
                  return (
                    <div key={safeKey} className="p-6 sm:px-8 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      
                      {/* Route & Status */}
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Ticket size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-slate-800">{booking.source}</h3>
                            <ArrowRight size={14} className="text-slate-400" />
                            <h3 className="font-bold text-lg text-slate-800">{booking.destination}</h3>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(booking.date)}</span>
                            <span className="text-slate-300">|</span>
                            <span>PNR: {booking.pnr || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side Info */}
                      <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Status</p>
                          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md flex items-center gap-1">
                            <Clock size={12}/> Completed
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">Total</p>
                          <p className="font-black text-slate-800 text-lg">₹{booking.amount || 0}</p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyBookings;