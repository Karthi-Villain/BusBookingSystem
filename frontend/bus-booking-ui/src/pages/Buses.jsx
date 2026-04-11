import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, Star, Wind, BedDouble, HelpCircle, 
  ChevronRight, ShieldCheck, Zap, ArrowUpDown, Clock
} from "lucide-react";

// List of available amenities with emojis for a clean look
const AMENITIES_LIST = [
  { name: "WIFI", icon: "📶" },
  { name: "Water Bottle", icon: "💧" },
  { name: "Blankets", icon: "🛌" },
  { name: "Charging Point", icon: "🔌" },
  { name: "Toilet", icon: "🚻" },
  { name: "Bed Sheet", icon: "🛏️" },
];

const getBusAmenities = (busId) => {
  const hash = String(busId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const count = (hash % 2) + 3; // Pick either 3 or 4 amenities
  const startIndex = hash % AMENITIES_LIST.length;
  
  const selected = [];
  for (let i = 0; i < count; i++) {
    selected.push(AMENITIES_LIST[(startIndex + i) % AMENITIES_LIST.length]);
  }
  return selected;
};

const Buses = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const source = searchParams.get("source");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FILTER & SORT STATE ---
  const [filters, setFilters] = useState({
    busTypes: [], 
    departureTimes: [] 
  });
  const [sortBy, setSortBy] = useState('price-asc');

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint logic
        const response = await api.get(`/search?source=${source}&destination=${destination}&date=${date}`);
        setBuses(response.data.data || []);
      } catch (err) {
        setError("Failed to fetch buses. Please ensure backend is running.");
      } finally {
        setLoading(false);
      }
    };

    if (source && destination && date) {
      fetchBuses();
    }
  }, [source, destination, date]);

  const formatTime = (datetimeStr) => {
    if (!datetimeStr) return "";
    return datetimeStr.split(" ")[1];
  };

  const getOriginalPrice = (price) => Math.round(price * 1.25);

  // --- FILTER & SORT LOGIC ---
  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const currentList = prev[category];
      if (currentList.includes(value)) {
        return { ...prev, [category]: currentList.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...currentList, value] };
      }
    });
  };

  const clearFilters = () => {
    setFilters({ busTypes: [], departureTimes: [] });
  };

  const filteredAndSortedBuses = useMemo(() => {
    let result = [...buses];

    // 1. Apply Bus Type Filters
    if (filters.busTypes.length > 0) {
      result = result.filter(bus => {
        const typeStr = (bus.busType || "").toLowerCase();
        return filters.busTypes.some(filterType => {
          if (filterType === 'AC') return typeStr.includes('ac') || typeStr.includes('a/c') && !typeStr.includes('non');
          if (filterType === 'Non-AC') return typeStr.includes('non');
          if (filterType === 'Sleeper') return typeStr.includes('sleeper');
          if (filterType === 'Seater') return typeStr.includes('seater');
          return false;
        });
      });
    }

    // 2. Apply Departure Time Filters
    if (filters.departureTimes.length > 0) {
      result = result.filter(bus => {
        const timeStr = bus.droppingTime?.split(" ")[1]; 
        if (!timeStr) return true;
        const hour = parseInt(timeStr.split(":")[0], 10);
        
        return filters.departureTimes.some(timeRange => {
          if (timeRange === 'before10') return hour < 10;
          if (timeRange === '10to17') return hour >= 10 && hour < 17;
          if (timeRange === '17to23') return hour >= 17 && hour < 23;
          if (timeRange === 'after23') return hour >= 23;
          return false;
        });
      });
    }

    // 3. Apply Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'departure-asc':
        result.sort((a, b) => {
          const timeA = a.boardingTime?.split(" ")[1] || "24:00";
          const timeB = b.boardingTime?.split(" ")[1] || "24:00";
          return timeA.localeCompare(timeB);
        });
        break;
      case 'departure-desc':
        result.sort((a, b) => {
          const timeA = a.boardingTime?.split(" ")[1] || "00:00";
          const timeB = b.boardingTime?.split(" ")[1] || "00:00";
          return timeB.localeCompare(timeA);
        });
        break;
      default:
        break;
    }

    return result;
  }, [buses, filters, sortBy]);

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-12 font-sans selection:bg-red-600 selection:text-white">
      
      {/* Top Search Summary Bar - Glassmorphism applied */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 bg-white/50 px-5 py-2 rounded-xl border border-slate-200 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">From</span>
              <span className="font-bold text-slate-800">{source}</span>
            </div>
            <ChevronRight className="text-red-500 mt-2" size={16} />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">To</span>
              <span className="font-bold text-slate-800">{destination}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-3"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Date</span>
              <span className="font-bold text-slate-800">{date}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate("/")} 
            className="text-sm bg-slate-900 text-white hover:bg-red-600 font-bold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Modify Search
          </button>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 mt-6 flex flex-col lg:flex-row gap-6">
        
        {/* LEFT SIDEBAR: Functional Filters Panel */}
        <motion.aside 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full lg:w-[280px] flex-shrink-0"
        >
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 sticky top-[90px]">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-800" />
                <h3 className="font-extrabold text-lg text-slate-900">Filters</h3>
              </div>
              {(filters.busTypes.length > 0 || filters.departureTimes.length > 0) && (
                <button onClick={clearFilters} className="text-xs text-red-600 font-bold hover:underline bg-red-50 px-2 py-1 rounded-md transition-colors">
                  Clear All
                </button>
              )}
            </div>
            
            {/* Bus Type Grid */}
            <div className="mb-6">
              <h4 className="font-bold text-sm text-slate-800 mb-3 uppercase tracking-wider text-[11px]">Bus Type</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'AC', icon: <Wind size={20} /> },
                  { id: 'Non-AC', icon: <span className="font-bold text-sm">Non AC</span> },
                  { id: 'Sleeper', icon: <BedDouble size={20} /> },
                  { id: 'Seater', icon: <div className="h-5 w-5 bg-current rounded-t-lg"></div> }
                ].map(type => {
                  const isActive = filters.busTypes.includes(type.id);
                  return (
                    <button 
                      key={type.id}
                      onClick={() => toggleFilter('busTypes', type.id)}
                      className={`flex flex-col items-center justify-center p-3 border rounded-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-0.5
                        ${isActive 
                          ? 'border-red-500 bg-red-50 text-red-600 shadow-md shadow-red-500/10' 
                          : 'border-slate-200 text-slate-500 hover:border-red-300 hover:bg-slate-50'
                        }`}
                    >
                      <div className={`mb-1 transition-colors ${isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-red-400'}`}>
                        {type.icon}
                      </div>
                      <span className={`text-xs font-bold ${isActive ? 'text-red-700' : 'text-slate-600'}`}>
                        {type.id}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Departure Time Grid */}
            <div className="mb-4">
              <h4 className="font-bold text-sm text-slate-800 mb-3 uppercase tracking-wider text-[11px]">Departure Time</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'before10', label: 'Before 10 AM', icon: '🌅' },
                  { id: '10to17', label: '10 AM - 5 PM', icon: '☀️' },
                  { id: '17to23', label: '5 PM - 11 PM', icon: '🌇' },
                  { id: 'after23', label: 'After 11 PM', icon: '🌙' }
                ].map(time => {
                  const isActive = filters.departureTimes.includes(time.id);
                  return (
                    <button 
                      key={time.id}
                      onClick={() => toggleFilter('departureTimes', time.id)}
                      className={`py-3 px-2 flex flex-col items-center justify-center border rounded-2xl transition-all duration-300 hover:-translate-y-0.5
                        ${isActive 
                          ? 'border-red-500 bg-red-50 text-red-700 font-bold shadow-md shadow-red-500/10' 
                          : 'border-slate-200 text-slate-600 font-medium hover:border-red-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className="text-xl mb-1">{time.icon}</span>
                      <span className="text-[11px] text-center font-bold tracking-tight">{time.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* RIGHT: Bus Listings & Sorting */}
        <div className="flex-1 space-y-4">
          
          {/* Sorting Bar */}
          {!loading && !error && buses.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="text-sm text-slate-500 font-medium px-2 self-start sm:self-center">
                Found <span className="font-extrabold text-slate-900">{filteredAndSortedBuses.length}</span> buses
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
                  <ArrowUpDown size={14} /> Sort By:
                </span>
                {[
                  { id: 'price-asc', label: 'Cheapest' },
                  { id: 'price-desc', label: 'Costliest' },
                  { id: 'departure-asc', label: 'Earliest' },
                  { id: 'departure-desc', label: 'Latest' },
                  { id: 'rating-desc', label: 'Top Rated' }
                ].map(sortOpt => (
                  <button
                    key={sortOpt.id}
                    onClick={() => setSortBy(sortOpt.id)}
                    className={`text-xs font-bold px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap shrink-0 border
                      ${sortBy === sortOpt.id 
                        ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/30' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600'
                      }`}
                  >
                    {sortOpt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Listings */}
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Searching for the best buses</h3>
              <p className="text-sm text-slate-500">Comparing prices and fetching real-time availability...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 p-8 rounded-3xl border border-red-100 text-red-600 flex flex-col items-center text-center shadow-sm"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="font-bold text-lg mb-1">Oops! Something went wrong</h3>
              <p className="text-sm opacity-80">{error}</p>
            </motion.div>
          ) : filteredAndSortedBuses.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center min-h-[400px] flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <HelpCircle size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No buses found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                We couldn't find any buses matching your current filters. Try adjusting your preferences to see more options.
              </p>
              <button 
                onClick={clearFilters}
                className="bg-red-50 text-red-600 font-bold px-6 py-2.5 rounded-xl hover:bg-red-100 transition-colors"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {filteredAndSortedBuses.map((bus, index) => {
                  
                  // SAFE ID FALLBACK: Handles MongoDB (_id), Standard (id), or Custom (busId)
                  const safeId = bus.busId || bus._id || bus.id || index;

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ type: "spring", stiffness: 80, damping: 15 }}
                      key={safeId} 
                      className="bg-white p-5 md:p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-red-200 transition-all duration-300 group flex flex-col"
                    >

                      {/* Main Content Area */}
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-4">
                        
                        {/* Left: Travels Info & Tags */}
                        <div className="w-full lg:w-[30%] flex flex-col gap-2">
                          <div className="flex gap-2 mb-1">
                            {bus.isAC && (
                              <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider">
                                <ShieldCheck size={10} /> Safe Journey
                              </span>
                            )}
                            {bus.rating >= 4.5 && (
                              <span className="bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider shadow-sm">
                                <Zap size={10} className="fill-amber-500 text-amber-500" /> Premium
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight group-hover:text-red-600 transition-colors">
                              {bus.travelsName || "Premium Travels"}
                            </h3>
                            <div className="bg-[#21b550] text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                              <Star size={12} className="fill-white" /> {bus.rating || "4.5"}
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 font-semibold leading-none">{bus.busType || "AC Sleeper (2+1)"}</p>
                        </div>
                        
                        {/* Middle: Timeline */}
                        <div className="flex items-center justify-between lg:justify-center gap-2 sm:gap-4 w-full lg:flex-1 mt-2 lg:mt-0">
                          <div className="text-left lg:text-right w-16 sm:w-20">
                            <p className="text-2xl font-black text-slate-900 tracking-tight">{formatTime(bus.boardingTime) || "20:30"}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{source}</p>
                          </div>
                          
                          <div className="flex flex-col items-center flex-1 max-w-[140px] px-2 group-hover:scale-105 transition-transform duration-300">
                            <span className="text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-widest flex items-center gap-1">
                              <Clock size={10} /> {bus.duration || "8h 30m"}
                            </span>
                            <div className="w-full flex items-center">
                              <div className="w-2 h-2 rounded-full border-[2px] border-red-600 bg-white z-10"></div>
                              <div className="flex-1 h-[2px] bg-slate-200 relative group-hover:bg-red-200 transition-colors">
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 group-hover:text-red-400 transition-colors">
                                   <ChevronRight size={16} />
                                 </div>
                              </div>
                              <div className="w-2 h-2 rounded-full border-[2px] border-slate-800 bg-slate-800 z-10 group-hover:border-red-600 group-hover:bg-red-600 transition-colors"></div>
                            </div>
                          </div>
                          
                          <div className="text-right lg:text-left w-16 sm:w-20">
                            <p className="text-2xl font-black text-slate-900 tracking-tight">{formatTime(bus.droppingTime) || "06:00"}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{destination}</p>
                          </div>
                        </div>

                        {/* Right: Pricing and CTA */}
                        <div className="w-full lg:w-[25%] flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 mt-1 lg:mt-0">
                          <div className="text-left lg:text-right">
                            <div className="flex items-center justify-start lg:justify-end gap-2 mb-0.5">
                              <p className="text-sm text-slate-400 line-through font-semibold">₹{getOriginalPrice(bus.price || 999)}</p>
                              <p className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">20% OFF</p>
                            </div>
                            <p className="text-3xl font-black text-slate-900 leading-none">₹{bus.price || 999}</p>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <button 
                              onClick={() => navigate(`/bus/${safeId}/seats?source=${source}&destination=${destination}&date=${date}`)}
                              className="bg-red-600 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-600/30 hover:shadow-slate-900/30 transition-all duration-300 active:scale-[0.98] w-[140px] mt-0 lg:mt-4 flex justify-center items-center gap-2 group/btn"
                            >
                              Select Seats
                            </button>
                            <p className={`text-[11px] mt-2 font-bold text-center w-full ${(bus.availableSeats || 10) <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                              {bus.availableSeats || 10} Seats Available
                            </p>
                          </div>
                        </div>

                      </div>

                      {/* Bottom: Amenities */}
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-50">
                        {getBusAmenities(safeId).map((amenity, idx) => (
                          <span 
                            key={idx} 
                            className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg group-hover:bg-white transition-colors"
                          >
                            <span className="text-sm">{amenity.icon}</span> {amenity.name}
                          </span>
                        ))}
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Buses;