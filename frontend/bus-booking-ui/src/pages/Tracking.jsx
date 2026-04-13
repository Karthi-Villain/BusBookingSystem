import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, MapPin, Bus, Navigation, Map, ExternalLink, AlertCircle, Clock } from "lucide-react";

const Tracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { source, destination, date, boardingTime, droppingTime, pnr } = location.state || {};

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Loading");
  const [eta, setEta] = useState("");

  useEffect(() => {
    if (!source || !boardingTime || !droppingTime || !date) return;

    const calculateProgress = () => {
      const now = new Date();
      
      const departureDate = new Date(date);
      const [bHours, bMins] = boardingTime.split(':').map(Number);
      departureDate.setHours(bHours || 0, bMins || 0, 0, 0);

      const arrivalDate = new Date(date);
      const [dHours, dMins] = droppingTime.split(':').map(Number);
      arrivalDate.setHours(dHours || 0, dMins || 0, 0, 0);

      if (arrivalDate < departureDate) {
        arrivalDate.setDate(arrivalDate.getDate() + 1);
      }

      const totalDuration = arrivalDate.getTime() - departureDate.getTime();
      const elapsed = now.getTime() - departureDate.getTime();

      if (elapsed < 0) {
        setProgress(0);
        setStatus("Upcoming");
        setEta("Awaiting Departure");
      } else if (elapsed > totalDuration) {
        setProgress(100);
        setStatus("Completed");
        setEta("Arrived at Destination");
      } else {
        const currentProgress = (elapsed / totalDuration) * 100;
        setProgress(Math.min(Math.max(currentProgress, 0), 100));
        setStatus("In Transit");
        
        const remainingMs = totalDuration - elapsed;
        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setEta(`${remainingHours}h ${remainingMins}m remaining`);
      }
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 60000);
    return () => clearInterval(interval);
  }, [date, boardingTime, droppingTime, source]);

  if (!source) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Journey Not Found</h2>
        <p className="text-slate-500 mb-6">We couldn't load the tracking details for this journey.</p>
        <button onClick={() => navigate(-1)} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-600/30">
          Go Back
        </button>
      </div>
    );
  }

  const embedMapUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(source)}&daddr=${encodeURIComponent(destination)}&output=embed`;
  const externalMapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 font-sans selection:bg-red-600 selection:text-white flex flex-col">
      
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={20} className="text-slate-700" />
            </button>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Navigation size={18} className="text-red-600" /> Live Tracking
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PNR: {pnr || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <span className={`w-2 h-2 rounded-full ${status === 'In Transit' ? 'bg-emerald-500 animate-pulse' : status === 'Upcoming' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{status}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-[45vh] md:h-[55vh] relative bg-slate-200"
        >
          <iframe 
            title="Route Map"
            src={embedMapUrl}
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: "contrast(1.1) saturation(1.1)" }}
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          
          <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white flex items-center gap-2 pointer-events-auto">
              <Map size={16} className="text-red-600" />
              <span className="text-sm font-bold text-slate-800">{source} to {destination}</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 -mt-12 relative z-20"
        >
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white p-6 md:p-8">
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock size={14} className="text-red-500"/> Estimated Arrival
                </p>
                <h2 className="text-3xl font-black text-slate-900">{status === 'Completed' ? droppingTime : eta}</h2>
              </div>
              <a 
                href={externalMapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-red-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-md"
              >
                Open Maps <ExternalLink size={16} />
              </a>
            </div>

            <div className="relative pt-6 pb-2">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                ></motion.div>
              </div>

              <motion.div 
                initial={{ left: 0 }}
                animate={{ left: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg border-2 border-red-600 flex items-center justify-center z-10"
              >
                <Bus size={18} className="text-red-600" />
              </motion.div>

              <div className="flex justify-between items-start mt-6">
                <div className="w-1/3 text-left">
                  <p className="text-lg font-black text-slate-900">{source}</p>
                  <p className="text-sm font-bold text-slate-500">{boardingTime}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Departure</p>
                </div>
                
                <div className="w-1/3 text-right">
                  <p className="text-lg font-black text-slate-900">{destination}</p>
                  <p className="text-sm font-bold text-slate-500">{droppingTime}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Arrival</p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Tracking;