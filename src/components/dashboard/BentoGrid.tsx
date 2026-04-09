import { motion } from "framer-motion";
import CountdownCard from "./CountdownCard";
import WeatherOverview from "./WeatherOverview";
import { Wallet, Users, MapPin, Compass, ArrowUpRight, Palmtree, Receipt, Map, PlaneTakeoff } from "lucide-react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  activeBudgetTotal?: number;
  groupSize?: number;
  setActiveTab: (tab: string) => void;
}

export default function BentoGrid({ activeBudgetTotal = 15500, groupSize = 8, setActiveTab }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4">
      {/* Main Hero Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => setActiveTab('itinerary')}
        className="md:col-span-2 md:row-span-2 glass rounded-[3rem] p-10 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4 text-[var(--foreground)]">The Expedition</p>
          <h2 className="text-5xl md:text-6xl font-serif font-bold leading-[1.1] text-[var(--foreground)]">The Monsoon <br />Trail</h2>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/[0.03] dark:bg-white/10 rounded-full border border-black/[0.05] dark:border-white/10">
            <MapPin size={12} className="text-[var(--accent)]" />
            <span className="text-[10px] font-bold text-[var(--foreground)]">Kerala, India</span>
          </div>
        </div>

        <ArrowUpRight className="absolute top-8 right-8 opacity-20 group-hover:opacity-100 transition-opacity text-[var(--foreground)]" size={20} />
      </motion.div>

      {/* Countdown Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="md:col-span-2 glass rounded-[2.5rem] p-6 lg:p-10"
      >
        <CountdownCard />
      </motion.div>

      {/* Group Bento */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="glass rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group"
      >
        <div className="flex items-center justify-between">
          <Users className="text-[var(--primary)]" size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Group</span>
        </div>
        <div className="relative">
          <p className="text-4xl md:text-5xl font-serif font-bold italic text-[var(--foreground)]">{groupSize}</p>
          <p className="text-[10px] md:text-[11px] font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)] mt-1">Explorers</p>
        </div>
        <div className="flex -space-x-2 mt-4 text-[var(--foreground)]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--background)] bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold">
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-[var(--background)] bg-[var(--primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--primary)]">
            +{groupSize - 4}
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-[0.05] dark:opacity-10 pointer-events-none rotate-12 group-hover:rotate-0 transition-transform duration-1000">
          <Palmtree size={220} className="text-[var(--primary)]" />
        </div>
      </motion.div>

      {/* Map Bento */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => setActiveTab('map')}
        className="glass rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group cursor-pointer bg-[var(--primary)]/[0.02]"
      >
        <div className="flex items-center justify-between">
          <Compass className="text-[var(--primary)]" size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Route</span>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-serif font-bold text-[var(--foreground)]">Trail Map</p>
          <p className="text-[10px] font-bold opacity-40 text-[var(--foreground)]">340km Total</p>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-[0.05] dark:opacity-10 pointer-events-none rotate-12 group-hover:rotate-0 transition-transform duration-1000">
          <Map size={220} className="text-[var(--primary)]" />
        </div>
        <ArrowUpRight className="absolute top-8 right-8 opacity-20 group-hover:opacity-100 transition-opacity text-[var(--foreground)]" size={16} />
      </motion.div>

      {/* Budget Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => setActiveTab('ledger')}
        className="md:col-span-2 glass rounded-[2.5rem] p-10 flex items-center justify-between bg-[var(--primary)]/[0.03] relative overflow-hidden group cursor-pointer"
      >
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
              <Wallet className="text-[var(--primary)]" size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Budget Overview</span>
          </div>
          <div>
            <p className="text-5xl font-serif font-bold text-[var(--foreground)]">₹{activeBudgetTotal.toLocaleString()}</p>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Estimated Per Person</p>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-[0.05] dark:opacity-10 pointer-events-none rotate-12 group-hover:rotate-0 transition-transform duration-1000">
          <Receipt size={220} className="text-[var(--primary)]" />
        </div>
        <ArrowUpRight className="absolute top-8 right-8 opacity-20 group-hover:opacity-100 transition-opacity text-[var(--foreground)]" size={16} />
      </motion.div>

      {/* Weather Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => setActiveTab('weather')}
        className="md:col-span-2 glass rounded-[2.5rem] p-8 lg:p-10 cursor-pointer group relative"
      >
        <WeatherOverview variant="mini" />
        <ArrowUpRight className="absolute top-8 right-8 opacity-20 group-hover:opacity-100 transition-opacity text-[var(--foreground)]" size={16} />
      </motion.div>
    </div>
  );
}
