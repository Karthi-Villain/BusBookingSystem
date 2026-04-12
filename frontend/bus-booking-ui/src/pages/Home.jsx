import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRightLeft, Calendar, Search, Tag, Info, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Chatbot from "../components/Chatbot";

const CITIES = [
  "Hyderabad", "Bangalore", "Chennai", "Mumbai", "Pune", "Delhi", 
  "Vijayawada", "Visakhapatnam", "Tirupati", "Coimbatore", "Madurai", 
  "Goa", "Nagpur", "Kolkata", "Bhubaneswar", "Indore", "Bhopal", 
  "Jaipur", "Chandigarh", "Manali", "Shimla", "Ahmedabad", "Rajkot", 
  "Lucknow", "Kanpur", "Khammam", "Guntur", "Hubli", "Belagavi", "Salem"
];

const CITY_IMAGES = {
  "Hyderabad": "/images/Hyderabad.png",
  "Nellore": "/images/Nellore.png",
  "Pune": "/images/Pune.png",
  "Bangalore": "/images/Bangalore.png",
  "Chennai": "/images/Chennai.png",
  "Goa": "/images/Goa.png"
};

const DEFAULT_IMG = "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=500&q=80";

// Helper to get true local date string avoiding UTC offset bugs
const getLocalDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Home = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  
  const today = getLocalDate(0);
  const tomorrow = getLocalDate(1);
  const [date, setDate] = useState(today);

  const filteredSources = CITIES.filter(c => c.toLowerCase().includes(source.toLowerCase()) && c !== destination);
  const filteredDestinations = CITIES.filter(c => c.toLowerCase().includes(destination.toLowerCase()) && c !== source);

  const handleSwap = () => {
    setSource(destination);
    setDestination(source);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!source || !destination || !date) {
      alert("Please fill all details to search!");
      return;
    }
    navigate(`/buses?source=${source}&destination=${destination}&date=${date}`);
  };

  // Handle Enter key for Source
  const handleSourceKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (showSourceDropdown && filteredSources.length > 0) {
        e.preventDefault(); // Prevent form submission
        setSource(filteredSources[0]);
        setShowSourceDropdown(false);
      }
    }
  };

  // Handle Enter key for Destination
  const handleDestKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (showDestDropdown && filteredDestinations.length > 0) {
        e.preventDefault(); // Prevent form submission
        setDestination(filteredDestinations[0]);
        setShowDestDropdown(false);
      }
    }
  };

  const handleQuickRoute = (src, dest) => {
    setSource(src);
    setDestination(dest);
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

  const offers = [
    { id: 1, title: "Save up to Rs 300 on bus tickets", code: "FLAT300", valid: "28 Apr", gradient: "from-red-500 to-red-700" },
    { id: 2, title: "Save up to 500 with HDFC cards", code: "HDFC500", valid: "30 Apr", gradient: "from-slate-700 to-slate-900" },
    { id: 3, title: "Save upto Rs 200 with AU Bank", code: "BUS200", valid: "30 Apr", gradient: "from-red-400 to-red-600" },
  ];

  const whatsNew = [
    { id: 1, title: "Free Cancellation", desc: "Get 100% refund on cancellation before 24H.", icon: <ShieldCheck size={28} />, color: "text-red-600" },
    { id: 2, title: "FlexiTicket", desc: "Amazing benefits on Date Change", icon: <Calendar size={28} />, color: "text-blue-600" },
    { id: 3, title: "Assurance Program", desc: "Insure your trip against accidents!", icon: <Info size={28} />, color: "text-red-500" },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.8 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70 } }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 font-sans selection:bg-red-600 selection:text-white">
      
      {/* HERO SECTION */}
      <motion.div 
        initial={{ height: "100vh" }}
        animate={{ height: "60vh" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="relative w-full overflow-hidden bg-slate-950 flex flex-col justify-center items-center px-6 pt-10 rounded-b-[3rem] shadow-2xl z-0"
      >
        {/* Floating Gradient Orbs & Grid Overlay - Updated to Red Theme */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[50rem] h-[50rem] bg-red-600/40 rounded-full mix-blend-screen filter blur-[100px] opacity-70"
          />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[10%] -right-[10%] w-[40rem] h-[40rem] bg-red-900/40 rounded-full mix-blend-screen filter blur-[100px] opacity-70"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-10 text-center max-w-4xl mx-auto mt-[-5vh]"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-red-300 text-sm font-medium mb-6">
            <Sparkles size={16} /> India's Premium Travel Partner
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Journey Beyond <br className="hidden md:block"/> Boundaries.
          </h1>
          <p className="text-slate-200 text-lg md:text-xl font-light max-w-2xl mx-auto">
            Experience next-level comfort. Book premium buses instantly with smart routes and unmatched safety.
          </p>
        </motion.div>
      </motion.div>

      {/* GLASSMORPHISM SEARCH BAR */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-[60]">
        <motion.form 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          onSubmit={handleSearch} 
          className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white flex flex-col md:flex-row items-center p-3 gap-3 relative z-[60]"
        >
          {/* Source Input */}
          <div className="relative flex-1 flex items-center bg-white/60 hover:bg-white transition-colors px-5 py-4 rounded-2xl w-full group">
            <MapPin className="text-red-600 mr-4 transition-transform group-hover:scale-110" size={24} />
            <div className="w-full">
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">From</p>
              <input 
                type="text" 
                placeholder="Where from?" 
                className="w-full outline-none font-bold text-slate-800 bg-transparent text-lg placeholder:text-slate-400"
                value={source}
                onChange={(e) => { setSource(e.target.value); setShowSourceDropdown(true); }}
                onKeyDown={handleSourceKeyDown}
                onFocus={() => setShowSourceDropdown(true)}
                onBlur={() => setShowSourceDropdown(false)}
                required
              />
            </div>
            {/* Source Dropdown - Z-index fixed */}
            <AnimatePresence>
              {showSourceDropdown && filteredSources.length > 0 && (
                <motion.ul 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-[110%] left-0 w-full bg-white border border-slate-100 shadow-2xl max-h-60 overflow-y-auto rounded-2xl z-[999] py-2"
                >
                  {filteredSources.map((city, index) => (
                    <li 
                      key={city} 
                      className={`px-6 py-3 hover:bg-red-50 hover:text-red-700 cursor-pointer text-slate-700 font-medium transition-colors ${index === 0 ? "bg-slate-50" : ""}`}
                      onMouseDown={(e) => { 
                        e.preventDefault(); 
                        setSource(city); 
                        setShowSourceDropdown(false); 
                      }}
                    >
                      {city} {index === 0 && <span className="text-[10px] ml-2 text-slate-400 bg-slate-200 px-2 py-0.5 rounded uppercase">Press Enter</span>}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Swap Button */}
          <button 
            type="button" 
            onClick={handleSwap} 
            className="bg-slate-900 text-white p-4 rounded-full hover:bg-red-600 hover:rotate-180 transition-all duration-300 z-[70] -mx-6 shadow-lg border-4 border-white hidden md:block group"
          >
            <ArrowRightLeft size={20} />
          </button>

          {/* Destination Input */}
          <div className="relative flex-1 flex items-center bg-white/60 hover:bg-white transition-colors px-5 py-4 rounded-2xl w-full group">
            <MapPin className="text-red-600 mr-4 transition-transform group-hover:scale-110" size={24} />
            <div className="w-full">
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">To</p>
              <input 
                type="text" 
                placeholder="Where to?" 
                className="w-full outline-none font-bold text-slate-800 bg-transparent text-lg placeholder:text-slate-400"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setShowDestDropdown(true); }}
                onKeyDown={handleDestKeyDown}
                onFocus={() => setShowDestDropdown(true)}
                onBlur={() => setShowDestDropdown(false)}
                required
              />
            </div>
            {/* Dest Dropdown - Z-index fixed */}
            <AnimatePresence>
              {showDestDropdown && filteredDestinations.length > 0 && (
                <motion.ul 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-[110%] left-0 w-full bg-white border border-slate-100 shadow-2xl max-h-60 overflow-y-auto rounded-2xl z-[999] py-2"
                >
                  {filteredDestinations.map((city, index) => (
                    <li 
                      key={city} 
                      className={`px-6 py-3 hover:bg-red-50 hover:text-red-700 cursor-pointer text-slate-700 font-medium transition-colors ${index === 0 ? "bg-slate-50" : ""}`}
                      onMouseDown={(e) => { 
                        e.preventDefault(); 
                        setDestination(city); 
                        setShowDestDropdown(false); 
                      }}
                    >
                      {city} {index === 0 && <span className="text-[10px] ml-2 text-slate-400 bg-slate-200 px-2 py-0.5 rounded uppercase">Press Enter</span>}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Date Input with Today/Tomorrow inline */}
          <div className="flex-[0.8] flex items-center bg-white/60 hover:bg-white transition-colors px-5 py-3 rounded-2xl w-full group relative">
            <Calendar className="text-slate-400 mr-4 transition-transform group-hover:scale-110" size={24} />
            <div className="w-full flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Date</p>
                {/* Today / Tomorrow Quick Selectors added back */}
                <div className="flex gap-1">
                  <button 
                    type="button" 
                    onMouseDown={() => setDate(today)}
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md transition-colors ${date === today ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    Today
                  </button>
                  <button 
                    type="button" 
                    onMouseDown={() => setDate(tomorrow)}
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md transition-colors ${date === tomorrow ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <input 
                type="date" 
                min={today}
                className="w-full outline-none font-bold text-slate-800 bg-transparent text-lg cursor-pointer"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Search Button - Changed to Red */}
          <button 
            type="submit" 
            className="w-full md:w-auto h-full min-h-[72px] bg-red-600 hover:bg-red-700 text-white font-bold px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-red-600/30"
          >
            <Search size={22} /> <span className="text-lg">Search</span>
          </button>
        </motion.form>

        {/* Staggered Quick Searches */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-8 flex flex-wrap gap-3 justify-center items-center relative z-10"
        >
          <motion.span variants={itemVariants} className="text-slate-500 text-sm font-semibold tracking-wide mr-2">
            Trending:
          </motion.span>
          {popularRoutes.slice(0, 4).map((route) => (
            <motion.button
              variants={itemVariants}
              key={`pill-${route.id}`}
              onClick={() => handleQuickRoute(route.source, route.destination)}
              className="bg-white/60 backdrop-blur-sm border border-slate-200/60 text-slate-600 px-5 py-2 rounded-full text-sm font-semibold hover:border-red-400 hover:text-red-600 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              {route.source} <span className="text-slate-300 mx-1">→</span> {route.destination}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-6xl mx-auto px-4 mt-24 space-y-24 relative z-10">
        
        {/* PREMIUM CARDS: Popular Destinations */}
        <section>
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Top Routes</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularRoutes.map((route) => (
              <div 
                key={`card-${route.id}`}
                onClick={() => handleQuickRoute(route.source, route.destination)}
                className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-slate-900"
              >
                <div className="absolute inset-0 flex transition-transform duration-700 group-hover:scale-105">
                  <img src={CITY_IMAGES[route.source] || DEFAULT_IMG} alt={route.source} className="w-1/2 h-full object-cover opacity-90" />
                  <div className="w-[1px] h-full bg-white/20 z-10 backdrop-blur-sm"></div>
                  <img src={CITY_IMAGES[route.destination] || DEFAULT_IMG} alt={route.destination} className="w-1/2 h-full object-cover opacity-90" />
                </div>
                
                {/* Fixed the dark overlay: reduced initial darkness, disappears on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:opacity-0 transition-opacity duration-500 z-10"></div>
                
                {/* Content Container - Added drop shadow to text so it remains visible without the overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col z-20">
                  <div className="flex items-center gap-3 text-white font-bold text-2xl mb-2 drop-shadow-md">
                    <span>{route.source}</span>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-white/50 to-transparent relative">
                       <ArrowRight size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-slate-900 rounded-full group-hover:text-red-500 transition-colors" />
                    </div>
                    <span>{route.destination}</span>
                  </div>
                  <div className="flex justify-between items-center drop-shadow-md">
                    <span className="text-white/90 text-sm font-bold tracking-wider uppercase">
                      From ₹499
                    </span>
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-red-600/40">
                      <ArrowRight size={18} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EXCLUSIVE OFFERS */}
        <section>
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Exclusive Offers</h2>
            <button className="text-slate-500 font-semibold hover:text-red-600 transition-colors flex items-center gap-1">
              View All <ArrowRight size={16}/>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className={`p-8 rounded-3xl bg-gradient-to-br ${offer.gradient} text-white relative overflow-hidden group shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}>
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                    Valid till {offer.valid}
                  </span>
                  <h3 className="font-extrabold text-2xl leading-tight mb-8 pr-8">{offer.title}</h3>
                  <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                    <span className="font-mono font-bold text-lg tracking-widest flex items-center gap-2">
                      {offer.code}
                    </span>
                    <button className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WHAT'S NEW */}
        <section>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-10">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whatsNew.map((item) => (
              <div key={item.id} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
      <Chatbot />
   </div>
  );
};

export default Home;