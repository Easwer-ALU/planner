import { useState, useEffect } from "react";
import { intervalToDuration, isBefore, type Duration } from "date-fns";
import { motion } from "framer-motion";

export default function CountdownCard() {
  const targetDate = new Date("2026-06-19T00:00:00");
  const [duration, setDuration] = useState<Duration | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (isBefore(now, targetDate)) {
        setDuration(intervalToDuration({ start: now, end: targetDate }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!duration) return null;

  return (
    <div className="flex flex-col h-full justify-between">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-[var(--foreground)]">The Countdown</p>
      
      <div className="grid grid-cols-4 gap-6 py-6 px-2">
        <div className="text-center space-y-1">
          <p className="text-4xl md:text-5xl font-serif font-bold text-[var(--foreground)]">{duration.months || 0}</p>
          <p className="text-[10px] font-black uppercase opacity-30 text-[var(--foreground)] tracking-widest">Mo</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-4xl md:text-5xl font-serif font-bold text-[var(--foreground)]">{duration.days || 0}</p>
          <p className="text-[10px] font-black uppercase opacity-30 text-[var(--foreground)] tracking-widest">Day</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-4xl md:text-5xl font-serif font-bold text-[var(--foreground)]">{duration.hours || 0}</p>
          <p className="text-[10px] font-black uppercase opacity-30 text-[var(--foreground)] tracking-widest">Hr</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-4xl md:text-5xl font-serif font-bold text-[var(--foreground)]">{duration.minutes || 0}</p>
          <p className="text-[10px] font-black uppercase opacity-30 text-[var(--foreground)] tracking-widest">Min</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex justify-between items-end px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-[var(--foreground)]">Trip Progress</p>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] drop-shadow-sm font-bold">75% READY</p>
        </div>
        <div className="h-3 w-full bg-black/[0.03] dark:bg-white/10 rounded-full overflow-hidden border border-black/[0.05] dark:border-white/5 p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "75%" }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-full bg-gradient-to-r from-emerald-600 to-[var(--accent)] dark:from-backwater-blue dark:to-backwater-amber relative rounded-full"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
