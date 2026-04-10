import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { 
  Star, ChevronLeft, Check, ShieldCheck, MapPin, Navigation, 
  User, Armchair, CreditCard, Camera
} from "lucide-react";

const Seats = () => {
  const { id: busId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const source = searchParams.get("source");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");

  // State Management
  const [step, setStep] = useState(1); // 1: Seats, 2: Boarding/Drop, 3: Passenger/Pay
  const [loading, setLoading] = useState(true);
  
  const [busDetails, setBusDetails] = useState(null);
  const [seatsLayout, setSeatsLayout] = useState({ lowerDeck: [], upperDeck: [] });
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const [stops, setStops] = useState({ boarding: [], dropping: [] });
  const [selectedBoarding, setSelectedBoarding] = useState(null);
  const [selectedDropping, setSelectedDropping] = useState(null);

  const [passengers, setPassengers] = useState([]);

  // --- NEW: Image Slider State ---
  const [busImages, setBusImages] = useState([]);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Bus Details
        const busRes = await api.get(`/bus/${busId}`);
        setBusDetails(busRes.data);

        // 2. Fetch Seats
        const seatsRes = await api.get(`/bus/${busId}/seats?source=${source}&destination=${destination}&date=${date}`);
        setSeatsLayout({
          lowerDeck: seatsRes.data.lowerDeck || [],
          upperDeck: seatsRes.data.upperDeck || []
        });

        // 3. NEW: Fetch Bus Images
        try {
          const imgRes = await api.get("/getBusImages");
          // Combine exterior and interior for the slider
          const allImages = [...(imgRes.data.exterior || []), ...(imgRes.data.interior || [])];
          setBusImages(allImages);
        } catch (imgErr) {
          console.warn("Failed to load bus images.");
        }

        // 4. Fetch Stops
        try {
          const stopsRes = await api.get(`/getRouteStops?source=${source}&destination=${destination}`);
          setStops({ boarding: stopsRes.data.boardingPoints, dropping: stopsRes.data.droppingPoints });
        } catch (stopErr) {
          console.warn("Stops API failed, using fallback data.");
          setStops({
            boarding: [{ name: "LB Nagar", address: "Near Metro Station" }, { name: "Ameerpet", address: "Mythrivanam" }],
            dropping: [{ name: "Silk Board", address: "Near Bus Stop" }, { name: "Madiwala", address: "Police Station" }]
          });
        }
      } catch (error) {
        console.error("Failed to load layout data", error);
        alert("Failed to load seat layout. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (busId && source && destination) fetchAllData();
  }, [busId, source, destination, date]);

  // --- NEW: Auto-slide Logic (3 Seconds) ---
  useEffect(() => {
    if (busImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev === busImages.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [busImages]);

  useEffect(() => {
    const pendingData = sessionStorage.getItem('pendingBooking');
    if (pendingData) {
      const parsed = JSON.parse(pendingData);
      setSelectedSeats(parsed.selectedSeats);
      setSelectedBoarding(parsed.selectedBoarding);
      setSelectedDropping(parsed.selectedDropping);
      setPassengers(parsed.passengers);
      setStep(3); // Jump directly to the final step
      sessionStorage.removeItem('pendingBooking');
    }
  }, []);

  // Handle Seat Selection
  const toggleSeat = (seat) => {
    if (!seat.available) return;

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.seatNo === seat.seatNo);
      if (isSelected) {
        return prev.filter(s => s.seatNo !== seat.seatNo);
      } else {
        if (prev.length >= 6) {
          alert("You can only select up to 6 seats at once.");
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const totalFare = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  // Initialize passenger array when moving to step 3
  const handleProceedToPassengers = () => {
    if (!selectedBoarding || !selectedDropping) {
      alert("Please select boarding and dropping points.");
      return;
    }
    setPassengers(selectedSeats.map(s => ({ seatNo: s.seatNo, name: "", age: "", gender: "M" })));
    setStep(3);
  };

  const handlePassengerChange = (index, field, value) => {
    const newPass = [...passengers];
    
    if (field === "age" && value !== "") {
      let numValue = Number(value);
      if (numValue > 100) {
        alert("Age cannot exceed 100 years.");
        value = ""; // Clear the value instead of setting to 100
      }
    }

    newPass[index][field] = value;
    setPassengers(newPass);
  };

  const handlePassengerBlur = (index, field, value) => {
    const newPass = [...passengers];

    if (field === "age" && value !== "") {
      let numValue = Number(value);
      if (numValue < 5) {
        alert("Passenger must be at least 5 years old.");
        newPass[index][field] = ""; // Clear the value instead of setting to 5
        setPassengers(newPass);
      }
    }
  };

  const handlePayment = () => {
    for (let p of passengers) {
      if (!p.name || !p.age) return alert("Please fill all passenger details.");
    }
    const token = localStorage.getItem('authToken');
    const bookingPayload = {
      busId, date, source, destination, totalFare,
      seats: selectedSeats.map(s => s.seatNo),
      selectedSeats, selectedBoarding, selectedDropping, passengers
    };
    if (!token) {
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingPayload));
      sessionStorage.setItem('returnUrl', window.location.pathname + window.location.search);
      navigate('/login');
      return;
    }
    navigate('/payment', { state: { bookingPayload } });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 font-sans">
      
      {/* Stepper Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)} className="p-2 hover:bg-gray-100 rounded-full transition">
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="font-bold text-lg text-gray-900">{source} to {destination}</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary border-b-2 border-primary pb-3 -mb-3' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 1 ? 'bg-primary' : 'bg-gray-300'}`}>1</span>
              Select Seats
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary border-b-2 border-primary pb-3 -mb-3' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 2 ? 'bg-primary' : 'bg-gray-300'}`}>2</span>
              Boarding & Dropping
            </div>
            <div className={`flex items-center gap-2 ${step === 3 ? 'text-primary border-b-2 border-primary pb-3 -mb-3' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step === 3 ? 'bg-primary' : 'bg-gray-300'}`}>3</span>
              Passenger & Pay
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-2/3 space-y-6">
          {step === 1 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-10 justify-center">
              {seatsLayout.lowerDeck?.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-4 px-2">
                    <span className="font-bold text-gray-700 text-sm">Lower Deck</span>
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center opacity-50"><div className="w-3 h-px bg-gray-300 transform rotate-45"></div></div>
                  </div>
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col gap-2">
                    {seatsLayout.lowerDeck.map((row, rIdx) => (
                      <div key={rIdx} className="flex gap-2">
                        {row.map((seat, sIdx) => {
                          if (!seat) return <div key={sIdx} className="w-8 h-10 md:w-10 md:h-12"></div>;
                          const isSelected = selectedSeats.some(s => s.seatNo === seat.seatNo);
                          const isSleeper = seat.type === "SLEEPER";
                          return (
                            <div 
                              key={seat.seatNo}
                              onClick={() => toggleSeat(seat)}
                              className={`relative flex flex-col items-center justify-center rounded transition-all cursor-pointer shadow-sm
                                ${isSleeper ? 'w-8 h-16 md:w-10 md:h-21' : 'w-8 h-10 md:w-10 md:h-10'}
                                ${!seat.available ? 'bg-[#e5e7eb] border-[#d1d5db] text-transparent cursor-not-allowed border' : 
                                  isSelected ? 'bg-primary border-primary text-white border-2' : 
                                  'bg-white border-gray-400 hover:border-primary text-gray-500 border'}`}
                            >
                              {isSleeper && <div className={`absolute top-1 w-2/3 h-2 rounded-sm ${!seat.available ? 'bg-gray-300' : isSelected ? 'bg-white/40' : 'bg-gray-200'}`}></div>}
                              {isSelected && <Check size={16} strokeWidth={3} className={isSleeper ? 'mt-2' : ''} />}
                              {seat.available && !isSelected && <span className="text-[9px] font-bold mt-auto pb-1">₹{seat.price}</span>}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {seatsLayout.upperDeck?.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="w-full text-center mb-4">
                    <span className="font-bold text-gray-700 text-sm">Upper Deck</span>
                  </div>
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col gap-2">
                    {seatsLayout.upperDeck.map((row, rIdx) => (
                      <div key={rIdx} className="flex gap-2">
                        {row.map((seat, sIdx) => {
                          if (!seat) return <div key={sIdx} className="w-8 h-10 md:w-10 md:h-12"></div>;
                          const isSelected = selectedSeats.some(s => s.seatNo === seat.seatNo);
                          const isSleeper = seat.type === "SLEEPER";
                          return (
                            <div 
                              key={seat.seatNo}
                              onClick={() => toggleSeat(seat)}
                              className={`relative flex flex-col items-center justify-center rounded transition-all cursor-pointer shadow-sm
                                ${isSleeper ? 'w-8 h-16 md:w-10 md:h-20' : 'w-8 h-10 md:w-10 md:h-12'}
                                ${!seat.available ? 'bg-[#e5e7eb] border-[#d1d5db] text-transparent cursor-not-allowed border' : 
                                  isSelected ? 'bg-primary border-primary text-white border-2' : 
                                  'bg-white border-gray-400 hover:border-primary text-gray-500 border'}`}
                            >
                              {isSleeper && <div className={`absolute top-1 w-2/3 h-2 rounded-sm ${!seat.available ? 'bg-gray-300' : isSelected ? 'bg-white/40' : 'bg-gray-200'}`}></div>}
                              {isSelected && <Check size={16} strokeWidth={3} className={isSleeper ? 'mt-2' : ''} />}
                              {seat.available && !isSelected && <span className="text-[9px] font-bold mt-auto pb-1">₹{seat.price}</span>}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-4"><Navigation size={18} className="text-primary"/> Boarding Point</h3>
                <div className="space-y-3">
                  {stops.boarding.map((stop, idx) => (
                    <label key={idx} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedBoarding?.name === stop.name ? 'border-primary bg-rose-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="boarding" className="mt-1 accent-primary w-4 h-4" checked={selectedBoarding?.name === stop.name} onChange={() => setSelectedBoarding(stop)} />
                      <div><p className="font-bold text-gray-900">{stop.name}</p><p className="text-xs text-gray-500 mt-0.5">{stop.address}</p></div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="hidden md:block w-px bg-gray-200"></div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-4"><MapPin size={18} className="text-blue-600"/> Dropping Point</h3>
                <div className="space-y-3">
                  {stops.dropping.map((stop, idx) => (
                    <label key={idx} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedDropping?.name === stop.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="dropping" className="mt-1 accent-blue-600 w-4 h-4" checked={selectedDropping?.name === stop.name} onChange={() => setSelectedDropping(stop)} />
                      <div><p className="font-bold text-gray-900">{stop.name}</p><p className="text-xs text-gray-500 mt-0.5">{stop.address}</p></div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2"><User size={22} className="text-primary"/> Passenger Details</h3>
              <div className="space-y-6">
                {passengers.map((p, idx) => (
                  <div key={idx} className="p-4 border border-gray-100 bg-gray-50 rounded-xl relative">
                    <span className="absolute -top-3 left-4 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Seat {p.seatNo}</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                        <input type="text" placeholder="Enter full name" className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-primary focus:ring-1 focus:ring-primary" value={p.name} onChange={(e) => handlePassengerChange(idx, "name", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Age</label>
                        <input type="number" min="5" max="100" placeholder="Years" className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-primary focus:ring-1 focus:ring-primary" value={p.age} onChange={(e) => handlePassengerChange(idx, "age", e.target.value)} onBlur={(e) => handlePassengerBlur(idx, "age", e.target.value)}/>
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Gender</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`gender-${idx}`} className="accent-primary" checked={p.gender === "M"} onChange={() => handlePassengerChange(idx, "gender", "M")} /> Male</label>
                          <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`gender-${idx}`} className="accent-primary" checked={p.gender === "F"} onChange={() => handlePassengerChange(idx, "gender", "F")} /> Female</label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 sticky top-[90px] overflow-hidden">
            
            {/* Bus Info Header */}
            <div className="bg-slate-800 p-5 text-white">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{busDetails?.travelsName || "Selected Bus"}</h3>
                <span className="bg-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Star size={10} className="fill-white" /> {busDetails?.rating || "4.5"}
                </span>
              </div>
              <p className="text-slate-300 text-xs mb-4">{busDetails?.busType || "AC Sleeper (2+1)"}</p>
              
              <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="text-center">
                  <p className="text-lg font-bold">{busDetails?.boardingTime || "21:45"}</p>
                  <p className="text-[10px] text-slate-400 uppercase">{source}</p>
                </div>
                <div className="text-xs text-slate-400 font-medium">{busDetails?.duration || "10h"}</div>
                <div className="text-center">
                  <p className="text-lg font-bold">{busDetails?.droppingTime || "07:45"}</p>
                  <p className="text-[10px] text-slate-400 uppercase">{destination}</p>
                </div>
              </div>
            </div>

            {/* --- NEW: PREMIUM IMAGE SLIDER --- */}
            {busImages.length > 0 && (
              <div className="relative h-48 w-full overflow-hidden bg-gray-200 border-b border-gray-100">
                <div 
                  className="flex h-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}
                >
                  {busImages.map((url, idx) => (
                    <img key={idx} src={url} alt="Bus View" className="min-w-full h-full object-cover" />
                  ))}
                </div>
                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {busImages.map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}></div>
                  ))}
                </div>
                <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded flex items-center gap-1 font-bold">
                  <Camera size={12} /> GALLERY
                </div>
              </div>
            )}

            {/* Selection Summary */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-600 uppercase flex items-center gap-2"><Armchair size={16}/> Selected Seats</span>
                <span className="bg-rose-100 text-primary font-bold text-xs px-2 py-1 rounded">{selectedSeats.length} Seats</span>
              </div>
              {selectedSeats.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No seats selected yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map(s => (
                    <span key={s.seatNo} className="border border-gray-300 px-3 py-1 rounded-lg text-sm font-bold text-gray-800 bg-gray-50">{s.seatNo}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Boarding/Dropping Summary (Appears in Step 3) */}
            {step === 3 && (
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 space-y-3">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Boarding Point</p><p className="text-sm font-bold text-gray-800">{selectedBoarding?.name}</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Dropping Point</p><p className="text-sm font-bold text-gray-800">{selectedDropping?.name}</p></div>
              </div>
            )}

            {/* Pricing & CTA Footer */}
            <div className="p-5 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-600">Total Fare</span>
                <span className="font-bold text-2xl text-gray-900">₹{totalFare}</span>
              </div>
              {step === 1 && (
                <button disabled={selectedSeats.length === 0} onClick={() => setStep(2)} className="w-full bg-primary hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition shadow-sm">Continue to Book</button>
              )}
              {step === 2 && (
                <button onClick={handleProceedToPassengers} className="w-full bg-primary hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm">Provide Passenger Details</button>
              )}
              {step === 3 && (
                <button onClick={handlePayment} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2"><CreditCard size={20} /> Pay ₹{totalFare} & Book</button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="p-4 bg-white flex justify-center gap-4 text-xs font-bold text-gray-400 border-t border-gray-100">
               <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-500"/> Secure Payment</span>
               <span className="flex items-center gap-1"><Check size={14} className="text-blue-500"/> Instant Ticket</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seats;