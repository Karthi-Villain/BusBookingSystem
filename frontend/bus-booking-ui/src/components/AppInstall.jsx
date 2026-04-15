import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

      

const AppInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowInstallPopup(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
  if (showInstallPopup) {
    const timer = setTimeout(() => setShowInstallPopup(false), 10000);
    return () => clearTimeout(timer);
  }
}, [showInstallPopup]);

  return (
    <AnimatePresence>
        {showInstallPopup && (
          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] w-[90%] max-w-xl"
          >
            <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-2xl px-5 py-4 flex items-center gap-4">

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-lg">
                <Sparkles size={22} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm">
                  Install BusBooking App 🚀
                </h3>
                <p className="text-xs text-slate-500">
                  Get faster booking, easy access & premium experience.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    deferredPrompt.prompt();
                    await deferredPrompt.userChoice;
                    setShowInstallPopup(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md"
                >
                  Install
                </button>

                <button
                  onClick={() => setShowInstallPopup(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
    </AnimatePresence>
  );
};

export default AppInstallPrompt;