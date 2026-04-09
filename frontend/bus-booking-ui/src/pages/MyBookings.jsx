import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../services/api"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

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

  const handleDownload = async (pnr) => {
    const input = ticketRefs.current[pnr];

    if (!input) return;

    const canvas = await html2canvas(input, {
    scale: 1, // better clarity
    useCORS: true,
    backgroundColor: "#ffffff", // FIX: removes faded overlay
    logging: false,
  });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 10;

    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    pdf.save(`Ticket_${pnr}.pdf`);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Fetching your trips...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">My Bookings</h1>
          <p className="text-gray-500 text-lg">View and manage all your upcoming and past journeys.</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8 animate-fade-in">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 text-sm text-red-600 hover:text-red-800 font-bold underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center animate-fade-in">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
               <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 12v4c0 .6.4 1 1 1h2m14 0a2 2 0 11-4 0 2 2 0 014 0zm-14 0a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't booked any trips yet. Start exploring destinations and plan your next journey!</p>
            <Link to="/" className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
              Book a Bus
            </Link>
          </div>
        )}

        {/* Bookings List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {bookings.map((booking, index) => (
            <div 
              key={booking.pnr} 
              ref={(el) => (ticketRefs.current[booking.pnr] = el)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden relative group transform hover:-translate-y-1"
              style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` }}
            >
              {/* Card Top / Brand Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-5 text-white flex justify-between items-center relative overflow-hidden">
                {/* Decorative circles to look like a ticket */}
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full"></div>
                <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full"></div>
                
                <div>
                  <p className="text-red-100 text-xs font-semibold uppercase tracking-wider mb-1">PNR Number</p>
                  <p className="text-lg font-bold tracking-widest">{booking.pnr}</p>
                </div>
                <div className="text-right">
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                    Confirmed
                  </span>
                </div>
              </div>

              {/* Route & Core Details */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Source</p>
                    <p className="text-xl font-bold text-gray-900">{booking.source}</p>
                  </div>
                  
                  <div className="px-4 flex flex-col items-center justify-center text-gray-300">
                     <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </div>

                  <div className="flex-1 text-right">
                    <p className="text-sm text-gray-500 font-medium">Destination</p>
                    <p className="text-xl font-bold text-gray-900">{booking.destination}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end pb-6 border-b border-gray-100 border-dashed">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Journey Date</p>
                    <p className="font-semibold text-gray-800">{formatDate(booking.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium mb-1">Total Fare</p>
                    <p className="text-2xl font-bold text-red-600">₹{booking.amount}</p>
                  </div>
                </div>

                {/* Passenger Details Area */}
                <div className="pt-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Passenger Details ({booking.passengers.length})
                  </h4>
                  
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    {booking.passengers.map((passenger, pIdx) => (
                      <div key={pIdx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold shadow-sm">
                             {passenger.name.charAt(0)}
                           </div>
                           <div>
                             <p className="font-semibold text-gray-800">{passenger.name}</p>
                             <p className="text-xs text-gray-500">{passenger.age} yrs • {passenger.gender === 'M' ? 'Male' : passenger.gender === 'F' ? 'Female' : 'Other'}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Seat</p>
                           <p className="font-bold text-gray-900 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">{passenger.seatNo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hover actions */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <button onClick={() => handleDownload(booking.pnr)} className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors">Download Ticket</button>
                 <button className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">Cancel Booking</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Inline styles for staggered fade in */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default MyBookings;