import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../services/api';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingPayload } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [status, setStatus] = useState('idle'); // idle, processing, success, error

  // Kick back if accessed directly without payload
  if (!bookingPayload) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid payment request. <button onClick={() => navigate('/')} className="text-primary underline">Go home</button></p>
      </div>
    );
  }

  const handleSimulatePayment = async () => {
    setStatus('processing');

    // Simulate network delay / bank processing (2 seconds)
    setTimeout(async () => {
      try {
        // Fire the ACTUAL booking API call now that payment "succeeded"
        const payloadForApi = {
          busId: bookingPayload.busId,
          date: bookingPayload.date,
          source: bookingPayload.source,
          destination: bookingPayload.destination,
          seats: bookingPayload.seats,
          passengers: bookingPayload.passengers
        };
        
        const res = await api.post("/book", payloadForApi);
        
        setStatus('success');
        
        // Show success animation for 2 seconds, then redirect to bookings
        setTimeout(() => {
          navigate("/my-bookings", { state: { newPnr: res.data.pnr } });
        }, 2000);

      } catch (err) {
        setStatus('error');
        console.error("Booking API Error:", err);
      }
    }, 2000);
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
        
        {/* Payment Selection */}
        <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Select Payment Method</h2>
          
          <div className="space-y-4 mb-8">
            {/* UPI Option */}
            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-primary bg-rose-50 ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
              <Smartphone size={24} className={paymentMethod === 'upi' ? 'text-primary' : 'text-gray-400'} />
              <div className="ml-4">
                <p className="font-bold text-gray-800">UPI / QR Code</p>
                <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
              </div>
            </label>

            {/* Card Option */}
            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-rose-50 ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
              <CreditCard size={24} className={paymentMethod === 'card' ? 'text-primary' : 'text-gray-400'} />
              <div className="ml-4">
                <p className="font-bold text-gray-800">Credit / Debit Card</p>
                <p className="text-xs text-gray-500">Visa, MasterCard, RuPay</p>
              </div>
            </label>
          </div>

          {/* Mock Input Fields based on selection */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
            {paymentMethod === 'upi' ? (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">UPI ID</label>
                <input type="text" defaultValue="mockuser@okhdfc" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white" readOnly />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Card Number</label>
                  <input type="text" defaultValue="**** **** **** 4242" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white" readOnly />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Expiry</label>
                    <input type="text" defaultValue="12/26" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white" readOnly />
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">CVV</label>
                    <input type="password" defaultValue="***" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white" readOnly />
                  </div>
                </div>
              </div>
            )}
          </div>

          {status === 'error' && (
            <div className="mb-4 text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">
              Booking failed. Please try again.
            </div>
          )}

          <button 
            onClick={handleSimulatePayment}
            disabled={status === 'processing'}
            className="w-full bg-primary hover:bg-rose-700 text-white font-bold py-4 rounded-xl transition shadow-md flex items-center justify-center gap-2"
          >
            {status === 'processing' ? (
              <><Loader2 size={20} className="animate-spin" /> Processing Payment...</>
            ) : (
              <>Pay ₹{bookingPayload.totalFare}</>
            )}
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400">
            <ShieldCheck size={14} /> This is a secure mock payment environment
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