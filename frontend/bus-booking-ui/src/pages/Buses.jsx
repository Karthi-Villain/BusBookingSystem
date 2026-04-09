import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
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

  return (
    <div className="bg-slate-50 min-h-screen pb-12 font-sans selection:bg-rose-200">
      
      {/* Top Search Summary Bar */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-2 rounded-xl border border-gray-100">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">From</span>
              <span className="font-bold text-gray-800">{source}</span>
            </div>
            <ChevronRight className="text-gray-400 mt-2" size={16} />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">To</span>
              <span className="font-bold text-gray-800">{destination}</span>
            </div>
            <div className="h-8 w-px bg-gray-200 mx-3"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Date</span>
              <span className="font-bold text-gray-800">{date}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate("/")} 
            className="text-sm bg-white border border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-600 font-bold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Modify Search
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 flex flex-col lg:flex-row gap-6">
        
        {/* LEFT SIDEBAR: Functional Filters Panel */}
        <aside className="w-full lg:w-[280px] flex-shrink-0">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-[90px]">
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-800" />
                <h3 className="font-bold text-lg text-gray-800">Filters</h3>
              </div>
              {(filters.busTypes.length > 0 || filters.departureTimes.length > 0) && (
                <button onClick={clearFilters} className="text-xs text-rose-600 font-bold hover:underline bg-rose-50 px-2 py-1 rounded-md">
                  Clear All
                </button>
              )}
            </div>
            
            {/* Bus Type Grid */}
            <div className="mb-6">
              <h4 className="font-bold text-sm text-gray-800 mb-3">Bus Type</h4>
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
                      className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all duration-200 cursor-pointer group
                        ${isActive 
                          ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-sm' 
                          : 'border-gray-200 text-gray-500 hover:border-rose-300 hover:bg-slate-50'
                        }`}
                    >
                      <div className={`mb-1 ${isActive ? 'text-rose-600' : 'text-gray-400 group-hover:text-rose-400'}`}>
                        {type.icon}
                      </div>
                      <span className={`text-xs font-semibold ${isActive ? 'text-rose-700' : 'text-gray-600'}`}>
                        {type.id}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Departure Time Grid */}
            <div className="mb-4">
              <h4 className="font-bold text-sm text-gray-800 mb-3">Departure Time</h4>
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
                      className={`py-2 px-2 flex flex-col items-center justify-center border rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold shadow-sm' 
                          : 'border-gray-200 text-gray-600 font-medium hover:border-rose-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className="text-lg mb-1">{time.icon}</span>
                      <span className="text-[11px] text-center leading-tight">{time.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT: Bus Listings & Sorting */}
        <div className="flex-1 space-y-4">
          
          {/* Sorting Bar */}
          {!loading && !error && buses.length > 0 && (
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500 font-medium px-2 self-start sm:self-center">
                Found <span className="font-bold text-gray-900">{filteredAndSortedBuses.length}</span> buses
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
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
                    className={`text-xs font-bold px-3 py-2 rounded-full transition-all whitespace-nowrap shrink-0
                      ${sortBy === sortOpt.id 
                        ? 'bg-gray-800 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {sortOpt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Listings */}
          {loading ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Searching for the best buses</h3>
              <p className="text-sm text-gray-500">Comparing prices and fetching real-time availability...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-8 rounded-2xl border border-red-100 text-red-600 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="font-bold text-lg mb-1">Oops! Something went wrong</h3>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          ) : filteredAndSortedBuses.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <HelpCircle size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No buses found</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                We couldn't find any buses matching your current filters. Try adjusting your preferences to see more options.
              </p>
              <button 
                onClick={clearFilters}
                className="bg-rose-50 text-rose-600 font-bold px-6 py-2.5 rounded-xl hover:bg-rose-100 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredAndSortedBuses.map((bus) => (
              <div 
                key={bus.busId} 
                // Reduced overall card padding slightly from p-6 to p-4 md:p-5
                className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-rose-100 transition-all duration-300 group flex flex-col"
              >

                {/* Main Content Area: Side-by-Side on Desktop */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-4">
                  
                  {/* Left: Travels Info & Tags */}
                  <div className="w-full lg:w-[30%] flex flex-col gap-1.5">
                    
                    {/* Tags MOVED HERE: Tighter padding and smaller text */}
                    <div className="flex gap-1.5 mb-0.5">
                      {bus.isAC && (
                        <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                          <ShieldCheck size={10} /> Safe Journey
                        </span>
                      )}
                      {bus.rating >= 4.5 && (
                        <span className="bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider shadow-sm">
                          <Zap size={10} className="fill-amber-500 text-amber-500" /> Premium
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xl text-gray-900 tracking-tight group-hover:text-rose-600 transition-colors">{bus.travelsName}</h3>
                      <div className="bg-[#21b550] text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                        <Star size={10} className="fill-white" /> {bus.rating}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-none">{bus.busType}</p>
                  </div>
                  
                  {/* Middle: Timeline */}
                  <div className="flex items-center justify-between lg:justify-center gap-2 sm:gap-4 w-full lg:flex-1 mt-2 lg:mt-0">
                    <div className="text-left lg:text-right w-16 sm:w-20">
                      <p className="text-2xl font-black text-gray-800 tracking-tight">{formatTime(bus.boardingTime)}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{source}</p>
                    </div>
                    
                    <div className="flex flex-col items-center flex-1 max-w-[140px] px-2">
                      <span className="text-[10px] text-gray-400 mb-1.5 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Clock size={10} /> {bus.duration}
                      </span>
                      <div className="w-full flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full border border-gray-300 bg-white z-10"></div>
                        <div className="flex-1 h-[1.5px] bg-gray-200 relative">
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300">
                             <ChevronRight size={14} />
                           </div>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full border border-gray-400 bg-gray-400 z-10"></div>
                      </div>
                    </div>
                    
                    <div className="text-right lg:text-left w-16 sm:w-20">
                      <p className="text-2xl font-black text-gray-800 tracking-tight">{formatTime(bus.droppingTime)}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{destination}</p>
                    </div>
                  </div>

                  {/* Right: Pricing and CTA */}
                  <div className="w-full lg:w-[25%] flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 mt-1 lg:mt-0">
                    <div className="text-left lg:text-right">
                      <div className="flex items-center justify-start lg:justify-end gap-2 mb-0.5">
                        <p className="text-sm text-gray-400 line-through font-medium">₹{getOriginalPrice(bus.price)}</p>
                        <p className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">20% OFF</p>
                      </div>
                      <p className="text-3xl font-black text-gray-900 leading-none">₹{bus.price}</p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <button 
                        onClick={() => navigate(`/bus/${bus.busId}/seats?source=${source}&destination=${destination}&date=${date}`)}
                        className="bg-[#ef2a4f] hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all active:scale-[0.98] w-[140px] mt-0 lg:mt-3"
                      >
                        Select Seats
                      </button>
                      <p className={`text-[11px] mt-1.5 font-bold text-center w-full ${bus.availableSeats <= 5 ? 'text-red-500' : 'text-[#009b72]'}`}>
                        {bus.availableSeats} Seats Available
                      </p>
                    </div>
                  </div>

                </div>

                {/* Bottom: Amenities - Reduced top margin, padding, and inner gap */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                  {getBusAmenities(bus.busId).map((amenity, idx) => (
                    <span 
                      key={idx} 
                      className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm text-gray-500 text-[12px] font-medium px-2 py-1 rounded-md"
                    >
                      <span className="text-xs">{amenity.icon}</span> {amenity.name}
                    </span>
                  ))}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Buses;