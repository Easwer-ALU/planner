"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Users, Calendar, ChevronDown } from "lucide-react";

interface HeroProps {
  planType: string;
  activeBudgetTotal: number;
  groupSize: number; // Added dynamic group size prop
}

export default function Hero({ planType, activeBudgetTotal, groupSize }: HeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const is5Day = planType === "5-day";
  const dateString = is5Day ? "June 19 — 23, 2026" : "June 19 — 22, 2026";
  
  // Format the dynamic budget (e.g. 15800 becomes 15.8)
  const formattedBudgetTotal = (activeBudgetTotal / 1000).toFixed(1);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#1A3326]">
      
      {/* Cinematic Background with Zoom/Fade effect */}
      <div 
        className={`absolute inset-0 z-0 bg-cover bg-center transition-all duration-[3000ms] ease-out scale-110 ${
          mounted ? "opacity-100 scale-100" : "opacity-0"
        }`}
        style={{ 
          backgroundImage: "url('/back.avif')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-[#F9F8F6]"></div>
      </div>

      {/* Main Headlines */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-white font-bold leading-none mb-8 drop-shadow-2xl">
            {is5Day ? "The Grand" : "The Monsoon"} <br />
            <span className="italic font-normal opacity-90">Trail</span>
          </h1>

          {/* Sub-info: Bolded for high visibility against the water background */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white font-black tracking-widest drop-shadow-2xl uppercase text-[10px] md:text-xs">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#E6A83C]" />
              <span>Western Ghats, Kerala</span>
            </div>
            <div className="w-1.5 h-1.5 bg-[#E6A83C] rounded-full hidden md:block"></div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#E6A83C]" />
              <span>{dateString}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dynamic Stats Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6"
      >
        <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-6 md:p-8 flex items-center justify-around shadow-2xl">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#E6A83C] mb-1">Duration</p>
            <p className="text-xl md:text-2xl font-serif font-bold text-white capitalize">{planType}</p>
          </div>
          
          <div className="h-10 w-[1px] bg-white/10"></div>
          
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#E6A83C] mb-1">Group</p>
            <p className="text-xl md:text-2xl font-serif font-bold text-white">
              {groupSize} {groupSize === 1 ? "Person" : "Persons"}
            </p>
          </div>
          
          <div className="h-10 w-[1px] bg-white/10"></div>
          
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#E6A83C] mb-1">Total Budget</p>
            <p className="text-xl md:text-2xl font-serif font-bold text-white">₹{formattedBudgetTotal}k</p>
          </div>
        </div>
      </motion.div>

      {/* Animated Scroll Hint */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30"
      >
        <ChevronDown size={24} />
      </motion.div>

    </section>
  );
}