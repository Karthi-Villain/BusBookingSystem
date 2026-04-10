import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Loader2, CreditCard } from 'lucide-react';
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

  // Kick back if accessed directly without payload
  if (!bookingPayload) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid payment request. <button onClick={() => navigate('/')} className="text-primary underline">Go home</button></p>
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

    /* NOTE: In a full production setup, you should generate an `order_id` 
      from your backend first using Razorpay's server SDK and pass it below.
      For test mode / frontend-only integration, you can omit it.
    */
    
    const options = {
      key: import.meta.env.VITE_RAZOR_KEY, // <-- REPLACE WITH YOUR TEST KEY
      amount: bookingPayload.totalFare * 100, // Razorpay expects amount in paise (₹1 = 100 paise)
      currency: "INR",
      name: "Bus Booking Service",
      description: `Tickets: ${bookingPayload.source} to ${bookingPayload.destination}`,
      
      handler: async function (response) {
        // This function triggers upon successful payment in Razorpay
        try {
          const payloadForApi = {
            busId: bookingPayload.busId,
            date: bookingPayload.date,
            source: bookingPayload.source,
            destination: bookingPayload.destination,
            seats: bookingPayload.seats,
            passengers: bookingPayload.passengers,
            paymentId: response.razorpay_payment_id // Pass ID to backend for verification if needed
          };
          
          const apiRes = await api.post("/book", payloadForApi);
          
          setStatus('success');
          
          // Show success animation for 2 seconds, then redirect to bookings
          setTimeout(() => {
            navigate("/my-bookings", { state: { newPnr: apiRes.data?.pnr } });
          }, 2000);

        } catch (err) {
          console.error("Booking API Error after payment:", err);
          setStatus('error');
          setTimeout(() => navigate(-1), 2000);
        }
      },
      prefill: {
        name: bookingPayload.passengers?.[0]?.name || "Test User",
        email: "testuser@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#e11d48", // Tailwind 'rose-600' to match your primary theme
      },
      modal: {
        ondismiss: function() {
          // Triggered when user closes the payment popup without paying
          setStatus('error');
          setTimeout(() => {
            navigate(-1); // Navigates back to the previous URL
          }, 2000);
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    
    // Explicit failure handler
    paymentObject.on('payment.failed', function (response) {
      console.error("Payment Failed:", response.error);
      setStatus('error');
      setTimeout(() => {
        navigate(-1); // Navigates back to the previous URL
      }, 2000);
    });

    paymentObject.open();
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl flex flex-col items-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">Your tickets have been confirmed.</p>
          <div className="w-8 h-8 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400 mt-4">Redirecting to your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Payment Action Panel */}
        <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-50 text-primary rounded-full mb-4">
              <CreditCard size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Booking</h2>
            <p className="text-gray-500">You will be redirected to Razorpay's secure checkout to complete your transaction.</p>
          </div>

          {status === 'error' && (
            <div className="mb-6 text-red-600 text-sm text-center font-medium bg-red-50 py-3 px-4 rounded-xl flex flex-col items-center">
              <span>Payment was not successful or was cancelled.</span>
              <span className="text-xs text-red-400 mt-1">Redirecting you back...</span>
            </div>
          )}

          <button 
            onClick={handleRazorpayPayment}
            disabled={status === 'processing' || status === 'error'}
            className="w-full bg-primary hover:bg-rose-700 text-white font-bold py-4 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'processing' ? (
              <><Loader2 size={20} className="animate-spin" /> Connecting to Gateway...</>
            ) : (
              <>Pay Securely — ₹{bookingPayload.totalFare}</>
            )}
          </button>
          
          <div className="mt-6 flex items-center justify-center gap-1 text-xs text-gray-400">
            <ShieldCheck size={16} /> 100% Secure Payment via Razorpay
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100">Booking Summary</h3>
            
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Route</span>
                <span className="font-bold text-gray-800">{bookingPayload.source} → {bookingPayload.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-bold text-gray-800">{bookingPayload.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Seats ({bookingPayload.seats.length})</span>
                <span className="font-bold text-gray-800">{bookingPayload.seats.join(', ')}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-800 text-lg">Total</span>
              <span className="font-black text-2xl text-primary">₹{bookingPayload.totalFare}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;