import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Bot, ArrowRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Assuming your axios instance is here

// Helper to get today's date for the seat selection URL fallback
const getLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi there! I'm your AI Travel Assistant. Where would you like to travel today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [giggle, setGiggle] = useState(false);
  
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Giggle and Tooltip animation trigger (every 5.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setGiggle(true);
        setShowTooltip(true);
        // Turn off giggle animation after it finishes
        setTimeout(() => setGiggle(false), 500);
        // Hide tooltip right before the next cycle
        setTimeout(() => setShowTooltip(false), 2500);
      }
    }, 5500);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Replace with your exact Flask API endpoint url if it's not configured in the axios instance
      const response = await api.post(import.meta.env.VITE_CHAT_BOT_API_URL || "http://127.0.0.1:5001/chat", { query: userMessage.text });
      const data = response.data;

      const botMessage = {
        sender: "bot",
        text: data.message || "I found some options for you.",
        info: data.info || null,
        q_type: data.q_type || null,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat API Error:", error);
      setMessages((prev) => [...prev, { 
        sender: "bot", 
        text: "I'm having trouble connecting to my servers right now. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {/* Floating Tooltip */}
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute -top-12 right-0 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-slate-700 whitespace-nowrap flex items-center gap-2 pointer-events-none"
          >
            <Sparkles size={14} className="text-red-400" />
            AI Assistance
            {/* Tooltip Tail */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 transform rotate-45 border-r border-b border-slate-700"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[380px] h-[500px] bg-white/90 backdrop-blur-2xl border border-white rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.12)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center justify-between shadow-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center border-2 border-white/20 shadow-inner">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                    Travel AI <Sparkles size={12} className="text-red-400" />
                  </h3>
                  <p className="text-slate-300 text-[10px] uppercase font-semibold tracking-wider">Online & Ready</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 hide-scrollbar">
              {messages.map((msg, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index} 
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Bubble */}
                  <div 
                    className={`max-w-[85%] px-4 py-3 text-sm shadow-sm ${
                      msg.sender === "user" 
                        ? "bg-slate-900 text-white rounded-2xl rounded-tr-sm" 
                        : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Dynamic Info Cards */}
                  {msg.info && msg.info.length > 0 && (
                    <div className="mt-3 w-[90%] space-y-2">
                      {msg.q_type === "stops" ? (
                        /* ── Stops: simple list with location pin ── */
                        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
                          <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-2">
                            Stops
                          </p>
                          <ul className="space-y-2">
                            {msg.info.map((stop, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                <MapPin size={14} className="text-red-500 mt-0.5 shrink-0" />
                                <span>{stop.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        /* ── Buses / Routes: full cards with Select Seats ── */
                        msg.info.map((bus, idx) => (
                          <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-sm">{bus.name}</h4>
                                <p className="text-[10px] text-slate-500 font-semibold">{bus.type}</p>
                              </div>
                              <span className="font-black text-slate-900">₹{bus.price}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded-lg">
                               <span className="font-bold text-slate-700">{bus.departure}</span>
                               <span>•</span>
                               <span className="truncate">{bus.from || "Source"} → {bus.to || "Dest"}</span>
                            </div>

                            <button 
                              onClick={() => navigate(`/bus/${bus.busid || 1}/seats?source=${bus.from || "Any"}&destination=${bus.to || "Any"}&date=${getLocalDate()}`)}
                              className="w-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 group-hover:shadow-sm"
                            >
                              Select Seats <ArrowRight size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Thinking Indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                  <div className="flex gap-1 items-center px-4 py-4 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm">
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100 z-10">
              <form onSubmit={handleSend} className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 shadow-inner focus-within:border-red-300 focus-within:ring-2 focus-within:ring-red-100 transition-all">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..." 
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-800 px-3 py-3 placeholder:text-slate-400"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-lg bg-red-600 hover:bg-slate-900 disabled:bg-slate-300 text-white flex items-center justify-center transition-all shadow-md"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        animate={giggle ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
        transition={{ duration: 0.5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-700 to-red-500 text-white shadow-[0_8px_30px_rgba(220,38,38,0.4)] flex items-center justify-center hover:scale-105 hover:shadow-[0_12px_40px_rgba(220,38,38,0.6)] transition-all active:scale-95 border-4 border-white/90"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <X size={26} strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <MessageCircle size={28} strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default Chatbot;