import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Code2, Layout, 
  Database, Zap, ShieldCheck, ExternalLink
} from 'lucide-react';
import Chatbot from "../components/Chatbot";

const AboutProject = () => {
  // Document path in the public folder (Now pointing to the PDF)
  const pdfPath = "/BusBooking_Project_Document.pdf";

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 15 } }
  };

  const techStack = [
    { icon: <Layout size={24} />, name: "React 18", desc: "Component-based UI architecture", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: <Zap size={24} />, name: "Tailwind CSS", desc: "Utility-first rapid styling", color: "text-sky-500", bg: "bg-sky-50" },
    { icon: <Code2 size={24} />, name: "Framer Motion", desc: "Fluid layout animations", color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
    { icon: <Database size={24} />, name: "Python Flask", desc: "Robust backend API", color: "text-green-600", bg: "bg-green-50" }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans selection:bg-red-600 selection:text-white">
      
      {/* HERO SECTION */}
      <div className="bg-slate-950 pt-20 pb-32 px-6 relative overflow-hidden rounded-b-[3rem] shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-red-600/30 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[30rem] h-[30rem] bg-slate-800/80 rounded-full mix-blend-screen filter blur-[80px] opacity-60"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-red-400 text-sm font-bold mb-6 tracking-wide uppercase">
            <ShieldCheck size={16} /> Architecture & Documentation
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Behind the <span className="text-red-500">Code.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Explore the technical documentation, system architecture, and the tech stack that powers this premium bus booking experience.
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20 space-y-12">
        
        {/* DOCUMENT VIEWER CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-white overflow-hidden flex flex-col"
        >
          {/* Viewer Header */}
          <div className="bg-white px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-red-100">
                <FileText size={28} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">BusBooking_Project_Document.pdf</h2>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Comprehensive System Overview & API Docs</p>
              </div>
            </div>
            
            <a 
              href={pdfPath} 
              download="BusBooking_Project_Document.pdf"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-600 text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
            >
              <Download size={18} className="group-hover:animate-bounce" /> 
              Download PDF
            </a>
          </div>

          {/* Iframe Container */}
          <div className="w-full h-[700px] bg-slate-100 relative flex items-center justify-center rounded-b-[2.5rem] overflow-hidden">
            {/* Fallback Message (Visible if iframe fails or browser blocks PDFs) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-0 bg-slate-50">
              <FileText size={48} className="text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold mb-2">Unable to display PDF directly</p>
              <p className="text-slate-400 text-sm max-w-sm mb-6">
                Your browser may not support embedded PDFs. Please use the download button above to view the document.
              </p>
            </div>

            {/* Native PDF Viewer embed */}
            {/* Adding #toolbar=0&navpanes=0 cleans up the default browser PDF viewer UI */}
            <iframe 
              src={`${pdfPath}#toolbar=0&navpanes=0&scrollbar=0`} 
              className="w-full h-full relative z-10 border-0 bg-transparent" 
              title="Project Documentation"
            ></iframe>
          </div>
        </motion.div>

        {/* TECH STACK SECTION */}
        <div className="pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">The Tech Stack</h2>
              <p className="text-slate-500 font-medium">Built with modern, scalable, and high-performance technologies.</p>
            </div>
            <a href="https://github.com/Karthi-Villain/BusBookingSystem" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm w-fit">
              <ExternalLink size={18} /> View Source Code
            </a>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {techStack.map((tech, index) => (
              <motion.div 
                variants={itemVariants}
                key={index} 
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default"
              >
                <div className={`w-12 h-12 rounded-2xl ${tech.bg} ${tech.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {tech.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{tech.name}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
      <Chatbot />
    </div>
  );
};

export default AboutProject;