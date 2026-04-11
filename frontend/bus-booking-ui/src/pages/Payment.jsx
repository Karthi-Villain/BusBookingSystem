import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, ShieldCheck, Loader2, CreditCard, 
  Lock, ArrowRight, MapPin, Calendar, Users, Receipt, BadgeCheck
} from 'lucide-react';
import api from '../services/api';

// Utility to load the Razorpay SDK script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingPayload } = location.state || {};
  
  const [status, setStatus] = useState('idle'); // idle, processing, success, error

  // Elaborate Bill Calculations (Reverse calculated to match exact totalFare)
  const billDetails = useMemo(() => {
    if (!bookingPayload) return null;
    const total = bookingPayload.totalFare;
    const taxAndFees = Math.round(total * 0.05); // 5% approx tax
    const platformFee = 39; // Fixed platform fee
    const baseFare = total - taxAndFees - platformFee;
    
    return {
      baseFare,
      taxAndFees,
      platformFee,
      total
    };
  }, [bookingPayload]);

  // Kick back if accessed directly without payload
  if (!bookingPayload) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-sans text-center px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={40} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Invalid Session</h2>
        <p className="text-slate-500 mb-6">Your payment session has expired or is invalid.</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handleRazorpayPayment = async () => {
    setStatus('processing');
    
    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setStatus('error');
      return;
    }
    
    const options = {
      key: import.meta.env.VITE_RAZOR_KEY, 
      amount: bookingPayload.totalFare * 100, // paise
      currency: "INR",
      name: "Premium Bus Travels",
      description: `Tickets: ${bookingPayload.source} to ${bookingPayload.destination}`,
      
      handler: async function (response) {
        try {
          const payloadForApi = {
            busId: bookingPayload.busId,
            date: bookingPayload.date,
            source: bookingPayload.source,
            destination: bookingPayload.destination,
            seats: bookingPayload.seats,
            passengers: bookingPayload.passengers,
            paymentId: response.razorpay_payment_id
          };
          
          const apiRes = await api.post("/book", payloadForApi);
          
          setStatus('success');
          
          // Show success animation for 2.5 seconds, then redirect to bookings
          setTimeout(() => {
            navigate("/my-bookings", { state: { newPnr: apiRes.data?.pnr } });
          }, 2500);

        } catch (err) {
          console.error("Booking API Error after payment:", err);
          setStatus('error');
          setTimeout(() => navigate(-1), 2500);
        }
      },
      prefill: {
        name: bookingPayload.passengers?.[0]?.name || "Guest User",
        email: "user@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#dc2626", // Tailwind 'red-600'
      },
      modal: {
        ondismiss: function() {
          setStatus('error');
          setTimeout(() => {
            navigate(-1); 
          }, 2000);
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    
    paymentObject.on('payment.failed', function (response) {
      console.error("Payment Failed:", response.error);
      setStatus('error');
      setTimeout(() => {
        navigate(-1); 
      }, 2500);
    });

    paymentObject.open();
  };

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  // --- SUCCESS SCREEN ---
  if (status === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] font-sans">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 70, damping: 15 }}
          className="bg-white p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-md w-full mx-4 border border-slate-100 relative overflow-hidden"
        >
          {/* Confetti/Glow background effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-50 to-transparent pointer-events-none"></div>

          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mb-8 relative z-10 shadow-inner"
          >
            <CheckCircle size={56} className="text-emerald-500" />
          </motion.div>

          <h2 className="text-3xl font-black text-slate-900 mb-3 text-center z-10">Payment Successful!</h2>
          <p className="text-slate-500 mb-8 text-center font-medium z-10">Your tickets are confirmed and ready. Pack your bags!</p>
          
          <div className="bg-slate-50 w-full p-4 rounded-2xl flex items-center justify-between mb-8 border border-slate-100 z-10">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Amount Paid</span>
            <span className="text-2xl font-black text-emerald-600">₹{bookingPayload.totalFare}</span>
          </div>

          <div className="flex items-center gap-3 z-10">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Generating Tickets...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- MAIN CHECKOUT SCREEN ---
  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 font-sans selection:bg-red-600 selection:text-white pb-24">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row gap-8"
      >
        
        {/* LEFT: Payment Action Panel */}
        <motion.div variants={itemVariants} className="w-full lg:w-[60%] flex flex-col gap-6">
          
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-10 overflow-hidden relative">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full filter blur-[80px] -mr-20 -mt-20 opacity-50"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                  <Lock size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Secure Checkout</h2>
                  <p className="text-sm text-slate-500 font-medium">Encrypted & safe payment processing</p>
                </div>
              </div>

              {/* Payment Methods Visuals */}
              <div className="mb-10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Supported Methods</p>
                <div className="flex flex-wrap gap-3">
                  {['UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map((method) => (
                    <div key={method} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2">
                      <BadgeCheck size={16} className="text-emerald-500" /> {method}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Alert */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 bg-red-50 border border-red-100 py-4 px-5 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-red-700 font-bold text-sm">Payment Failed or Cancelled</p>
                      <p className="text-xs text-red-500 font-medium mt-0.5">Redirecting you back to try again...</p>
                    </div>
                    <Loader2 size={18} className="text-red-500 animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pay Button */}
              <button 
                onClick={handleRazorpayPayment}
                disabled={status === 'processing' || status === 'error'}
                className="w-full bg-red-600 hover:bg-slate-900 text-white font-black text-lg py-5 rounded-2xl transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-slate-900/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {status === 'processing' ? (
                  <><Loader2 size={24} className="animate-spin" /> Connecting to Gateway...</>
                ) : (
                  <>
                    Pay ₹{bookingPayload.totalFare} Securely 
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={16} className="text-emerald-500" /> Powered by Razorpay
              </div>
            </div>
          </div>

        </motion.div>

        {/* RIGHT: Elaborate Order Summary */}
        <motion.div variants={itemVariants} className="w-full lg:w-[40%]">
          <div className="bg-slate-800 text-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] p-8 sticky top-8">
            
            <h3 className="font-extrabold text-xl mb-6 pb-6 border-b border-slate-700/50 flex items-center gap-2">
              <Receipt className="text-red-500" size={24}/> Booking Summary
            </h3>
            
            {/* Route Details */}
            <div className="flex justify-between items-center mb-8 bg-slate-900 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">From</p>
                <p className="text-lg font-black">{bookingPayload.source}</p>
              </div>
              <div className="px-4 text-red-500">
                <ArrowRight size={20} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">To</p>
                <p className="text-lg font-black">{bookingPayload.destination}</p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <Calendar size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Journey Date</p>
                  <p className="font-bold text-sm">{bookingPayload.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <Users size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Passengers & Seats</p>
                  <p className="font-bold text-sm">{bookingPayload.seats.length} Tickets (Seats: {bookingPayload.seats.join(', ')})</p>
                </div>
              </div>
            </div>

            {/* Elaborate Bill */}
            <div className="bg-white rounded-2xl p-6 text-slate-900 relative">
              {/* Ticket zig-zag top edge effect */}
              <div className="absolute -top-2 left-0 w-full h-4 bg-slate-900" style={{ maskImage: 'radial-gradient(circle 6px at 12px 0, transparent 0, transparent 12px, black 13px)', maskSize: '24px 10px', maskRepeat: 'repeat-x' }}></div>

              <h4 className="font-extrabold text-sm uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Fare Breakdown</h4>
              
              <div className="space-y-3 mb-4 text-sm font-bold text-slate-600">
                <div className="flex justify-between">
                  <span>Base Fare ({bookingPayload.seats.length} x)</span>
                  <span className="text-slate-900">₹{billDetails.baseFare}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & GST (5%)</span>
                  <span className="text-slate-900">₹{billDetails.taxAndFees}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="text-slate-900">₹{billDetails.platformFee}</span>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-dashed border-slate-200 flex justify-between items-end">
                <div>
                  <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">Grand Total</span>
                </div>
                <span className="font-black text-3xl text-red-600 leading-none">₹{billDetails.total}</span>
              </div>
            </div>

          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Payment;