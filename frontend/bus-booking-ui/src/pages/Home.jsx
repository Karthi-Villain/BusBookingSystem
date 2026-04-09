import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRightLeft, Calendar, Search, Tag, Info, ShieldCheck, ArrowRight } from "lucide-react";

const CITIES = [
  "Hyderabad", "Bangalore", "Chennai", "Mumbai", "Pune", "Delhi", 
  "Vijayawada", "Visakhapatnam", "Tirupati", "Coimbatore", "Madurai", 
  "Goa", "Nagpur", "Kolkata", "Bhubaneswar", "Indore", "Bhopal", 
  "Jaipur", "Chandigarh", "Manali", "Shimla", "Ahmedabad", "Rajkot", 
  "Lucknow", "Kanpur", "Khammam", "Guntur", "Hubli", "Belagavi", "Salem"
];

// 1. Add your Image Dictionary here. 
// Replace these Unsplash placeholder URLs with your actual image links later.
const CITY_IMAGES = {
  "Hyderabad": "/images/Hyderabad.png",
  "Nellore": "/images/Nellore.png",
  "Pune": "/images/Pune.png",
  "Bangalore": "/images/Bangalore.png",
  "Chennai": "/images/Chennai.png",
  "Goa": "/images/Goa.png"
};

// Fallback image if city is not in dictionary
const DEFAULT_IMG = "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=500&q=80";

const Home = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  
  const today = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];
  
  const [date, setDate] = useState(today);

  // Filter cities based on input and prevent selecting the same city
  const filteredSources = CITIES.filter(c => c.toLowerCase().includes(source.toLowerCase()) && c !== destination);
  const filteredDestinations = CITIES.filter(c => c.toLowerCase().includes(destination.toLowerCase()) && c !== source);

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!source || !destination || !date) {
      alert("Please fill all details to search!");
      return;
    }
    navigate(`/buses?source=${source}&destination=${destination}&date=${date}`);
  };

  const handleQuickRoute = (src, dest) => {
    setSource(src);
    setDestination(dest);
    // Optional: Scroll to top smoothly so user can see the populated search bar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mock Data
  const popularRoutes = [
    { id: 1, source: "Nellore", destination: "Hyderabad" },
    { id: 2, source: "Hyderabad", destination: "Nellore" },
    { id: 3, source: "Hyderabad", destination: "Pune" },
    { id: 4, source: "Pune", destination: "Hyderabad" },
    { id: 5, source: "Bangalore", destination: "Hyderabad" },
    { id: 6, source: "Hyderabad", destination: "Bangalore" },
  ];

  // Mock Data
  const offers = [
    { id: 1, title: "Save up to Rs 300 on bus tickets", code: "FLAT300", valid: "28 Apr", bg: "bg-orange-100 border-orange-200" },
    { id: 2, title: "Save up to 500 with HDFC cards", code: "HDFC500", valid: "30 Apr", bg: "bg-blue-100 border-blue-200" },
    { id: 3, title: "Save upto Rs 200 with AU Bank", code: "BUS200", valid: "30 Apr", bg: "bg-purple-100 border-purple-200" },
  ];

  const whatsNew = [
    { id: 1, title: "Free Cancellation", desc: "Get 100% refund on cancellation before 24H.", icon: <ShieldCheck size={32} />, bg: "bg-rose-800 text-white" },
    { id: 2, title: "FlexiTicket", desc: "Get amazing benefits on Date Change", icon: <Calendar size={32} className="text-blue-600"/>, bg: "bg-blue-50 text-blue-900 border border-blue-200" },
    { id: 3, title: "Assurance Program", desc: "Insure your trip against accidents!", icon: <Info size={32} className="text-rose-600"/>, bg: "bg-rose-50 text-rose-900 border border-rose-200" },
  ];

  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-12">
      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 w-full pt-16 pb-28 px-6 text-center relative">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          India's No. 1 online bus ticket booking site
        </h1>
        <p className="text-slate-300 text-lg">Book your bus tickets with ease and travel safely.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center p-2 gap-2 border border-gray-200">
          
          {/* Source Input */}
          <div className="relative flex-1 flex items-center bg-white px-4 py-3 rounded-xl border border-transparent hover:border-gray-200 w-full">
            <MapPin className="text-gray-400 mr-3" size={20} />
            <div className="w-full">
              <p className="text-xs text-gray-500 font-semibold uppercase">From</p>
              <input 
                type="text" 
                placeholder="Source City" 
                className="w-full outline-none font-bold text-gray-800 bg-transparent"
                value={source}
                onChange={(e) => { setSource(e.target.value); setShowSourceDropdown(true); }}
                onFocus={() => setShowSourceDropdown(true)}
                onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
                required
              />
            </div>
            {/* Source Dropdown */}
            {showSourceDropdown && filteredSources.length > 0 && (
              <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto rounded-lg z-50 mt-1">
                {filteredSources.map((city) => (
                  <li 
                    key={city} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 font-medium"
                    onClick={() => { setSource(city); setShowSourceDropdown(false); }}
                  >
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Swap Button */}
          <button type="button" onClick={handleSwap} className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition z-10 -mx-4 shadow-sm border border-white hidden md:block">
            <ArrowRightLeft className="text-gray-600" size={18} />
          </button>

          {/* Destination Input */}
          <div className="relative flex-1 flex items-center bg-white px-4 py-3 rounded-xl border border-transparent hover:border-gray-200 w-full">
            <MapPin className="text-gray-400 mr-3" size={20} />
            <div className="w-full">
              <p className="text-xs text-gray-500 font-semibold uppercase">To</p>
              <input 
                type="text" 
                placeholder="Destination City" 
                className="w-full outline-none font-bold text-gray-800 bg-transparent"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setShowDestDropdown(true); }}
                onFocus={() => setShowDestDropdown(true)}
                onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                required
              />
            </div>
            {/* Dest Dropdown */}
            {showDestDropdown && filteredDestinations.length > 0 && (
              <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto rounded-lg z-50 mt-1">
                {filteredDestinations.map((city) => (
                  <li 
                    key={city} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 font-medium"
                    onClick={() => { setDestination(city); setShowDestDropdown(false); }}
                  >
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Date Input & Quick Dates */}
          <div className="flex-1 flex items-center bg-white px-4 py-3 border-l md:border-t-0 border-t border-gray-100 w-full">
            <Calendar className="text-gray-400 mr-3" size={20} />
            <div className="w-full flex flex-col">
              <p className="text-xs text-gray-500 font-semibold uppercase">Date</p>
              <input 
                type="date" 
                min={today}
                className="w-full outline-none font-bold text-gray-800 bg-transparent cursor-pointer"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2 ml-2">
              <button 
                type="button" 
                onClick={() => setDate(today)}
                className={`text-sm px-4 py-2 rounded-md font-semibold transition ${date === today ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Today
              </button>
              <button 
                type="button"
                onClick={() => setDate(tomorrow)}
                className={`text-sm px-4 py-2 rounded-md font-semibold transition ${date === tomorrow ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Tomorrow
              </button>
            </div>
          </div>

          {/* Search Button */}
          <button type="submit" className="w-full md:w-auto bg-primary hover:bg-rose-700 text-white font-bold px-8 py-5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer">
            <Search size={20} /> Search Buses
          </button>
        </form>

        {/* Quick Searches Pills (Kept as requested) */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <span className="text-gray-500 text-sm font-medium py-2">Quick Searches:</span>
          {popularRoutes.map((route) => (
            <button
              key={`pill-${route.id}`}
              onClick={() => handleQuickRoute(route.source, route.destination)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:border-primary hover:text-primary transition shadow-sm"
            >
              {route.source} ↔ {route.destination}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-16 space-y-16">
        
        {/* NEW: POPULAR DESTINATIONS VISUAL CARDS */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-[#000000] font-serif">Popular Routes</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoutes.map((route) => (
              <div 
                key={`card-${route.id}`}
                onClick={() => handleQuickRoute(route.source, route.destination)}
                className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image Split Container */}
                <div className="absolute inset-0 flex transition-transform duration-700 group-hover:scale-110">
                  {/* Source Image (Left half) */}
                  <img 
                    src={CITY_IMAGES[route.source] || DEFAULT_IMG} 
                    alt={route.source} 
                    className="w-1/2 h-full object-cover"
                  />
                  {/* Subtle divider */}
                  <div className="w-0.5 h-full bg-white/40 z-10"></div>
                  {/* Destination Image (Right half) */}
                  <img 
                    src={CITY_IMAGES[route.destination] || DEFAULT_IMG} 
                    alt={route.destination} 
                    className="w-1/2 h-full object-cover"
                  />
                </div>
                
                {/* Gradient Overlays for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>

                {/* Text Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col">
                  <div className="flex items-center gap-2 text-white font-bold text-xl leading-tight">
                    <span>{route.source}</span>
                    <ArrowRight size={18} className="text-white/80 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" />
                    <span>{route.destination}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-white/80 text-sm font-medium tracking-wide">
                      Select Route
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-100">
                      <Search size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OFFERS SECTION */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Offers for you</h2>
            <button className="text-blue-600 font-semibold text-sm hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className={`p-6 rounded-2xl border ${offer.bg} flex flex-col justify-between shadow-sm`}>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-6">Valid till {offer.valid}</p>
                </div>
                <div className="flex items-center justify-between bg-white/60 p-3 rounded-lg border border-white border-opacity-40">
                  <span className="font-mono font-bold text-gray-800 flex items-center gap-2">
                    <Tag size={16} className="text-primary" /> {offer.code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WHAT'S NEW SECTION */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What's new</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whatsNew.map((item) => (
              <div key={item.id} className={`p-6 rounded-2xl flex items-center gap-4 shadow-sm ${item.bg}`}>
                <div className="p-3 bg-white/20 rounded-full">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm opacity-90 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
   </div>
  );
};

export default Home;