import { motion } from "framer-motion";
import { MapPin, Users, Calendar, ChevronDown, Receipt } from "lucide-react";

export default function Hero({ planType = "4-day", groupSize = 8, activeBudgetTotal = 15500 }: { planType?: string; groupSize?: number; activeBudgetTotal?: number }) {
  const is5Day = planType === "5-day";
  const dateString = is5Day ? "June 19 — 23, 2026" : "June 19 — 22, 2026";

  // Format the dynamic budget (e.g. 15800 becomes 15.8)
  const formattedBudgetTotal = (activeBudgetTotal / 1000).toFixed(1);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">

      {/* Background Image with Cinematic Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0B0914]">
        <img 
          src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=1920" 
          alt=""
          className="w-full h-full object-cover scale-105 animate-subtle-zoom"
          loading="eager"
          style={{ contentVisibility: 'auto' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/20 to-[var(--background)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 text-white/60 font-black tracking-[0.4em] uppercase text-[10px] md:text-xs">
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-coconut-sunset" /> Kerala, India
            </span>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="flex items-center gap-2">
              <Calendar size={14} className="text-backwater-blue" /> {dateString}
            </span>
          </div>

          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-white font-bold leading-none tracking-tight">
            The Monsoon <br />
            <span className="italic font-normal opacity-90 text-coconut-sunset dark:text-backwater-amber">Trail</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <div className="glass px-8 py-3.5 rounded-full flex items-center gap-3 text-[var(--foreground)] shadow-xl border-black/[0.04] dark:border-white/10 group/pill hover:scale-105 transition-transform duration-500">
            <Users size={16} className="text-[var(--accent)]" />
            <span className="text-[12px] font-black uppercase tracking-widest">{groupSize} Friends</span>
          </div>
          <div className="glass px-8 py-3.5 rounded-full flex items-center gap-3 text-[var(--foreground)] shadow-xl border-black/[0.04] dark:border-white/10 group/pill hover:scale-105 transition-transform duration-500">
            <Calendar size={16} className="text-[var(--accent)]" />
            <span className="text-[12px] font-black uppercase tracking-widest">{planType} Expedition</span>
          </div>
          <div className="glass px-8 py-3.5 rounded-full flex items-center gap-3 text-[var(--foreground)] shadow-xl border-black/[0.04] dark:border-white/10 group/pill hover:scale-105 transition-transform duration-500">
            <Receipt size={16} className="text-[var(--accent)]" />
            <span className="text-[12px] font-black uppercase tracking-widest">₹{formattedBudgetTotal}k Total</span>
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
      >
        <ChevronDown size={24} />
      </motion.div>

    </section>
  );
}
