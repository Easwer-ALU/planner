import { CloudRain, Sun, Cloud, Wind, Droplets, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const locations = [
  { 
    name: "Alleppey", 
    weather: "Rainy", 
    temp: 28, 
    humidity: 88,
    wind: "12 km/h",
    visibility: "4 km",
    forecast: [27, 26, 28]
  },
  { 
    name: "Munnar", 
    weather: "Misty", 
    temp: 18, 
    humidity: 92,
    wind: "8 km/h",
    visibility: "1 km",
    forecast: [17, 19, 18]
  },
  { 
    name: "Kochi", 
    weather: "Sunny", 
    temp: 31, 
    humidity: 65,
    wind: "15 km/h",
    visibility: "10 km",
    forecast: [32, 30, 31]
  },
];

const WeatherIcon = ({ condition, size = 20, className = "" }: { condition: string, size?: number, className?: string }) => {
  const cond = condition.toLowerCase();
  if (cond.includes("rain")) return <CloudRain size={size} className={cn("text-emerald-600 dark:text-backwater-blue", className)} />;
  if (cond.includes("mist") || cond.includes("cloud")) return <Cloud size={size} className={cn("text-[var(--foreground)] opacity-40 dark:opacity-60", className)} />;
  return <Sun size={size} className={cn("text-[var(--accent)]", className)} />;
};

interface WeatherOverviewProps {
  variant?: 'mini' | 'full';
}

export default function WeatherOverview({ variant = 'full' }: WeatherOverviewProps) {
  if (variant === 'mini') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center justify-between mb-8 px-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-[var(--foreground)]">Weather Overview</span>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-600/40 dark:bg-backwater-blue/40" />
            <div className="w-2 h-2 rounded-full bg-emerald-600/20 dark:bg-backwater-blue/20" />
          </div>
        </div>
        
        <div className="flex gap-10 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6">
          {locations.map((loc, i) => (
            <div 
              key={i} 
              className="min-w-full snap-center flex flex-col items-center justify-center gap-6 py-4"
            >
              <div className="p-8 bg-black/[0.03] dark:bg-white/5 rounded-[3rem] border border-black/[0.05] dark:border-white/5 shadow-inner">
                <WeatherIcon condition={loc.weather} size={48} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-serif font-bold uppercase tracking-[0.1em] text-[var(--foreground)]">{loc.name}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-[var(--foreground)]">{loc.weather}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-[8px] text-center font-black uppercase tracking-[0.5em] opacity-20 mt-4 text-[var(--foreground)]">
          Swipe locations
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="space-y-4">
        <p className="text-xs font-black uppercase tracking-[0.5em] opacity-40 text-[var(--foreground)]">Atmospheric Conditions</p>
        <h2 className="text-4xl md:text-7xl font-serif font-bold italic text-emerald-800 dark:text-backwater-blue tracking-tight">The Monsoon Mood</h2>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {locations.map((loc, i) => (
          <div key={i} className="glass p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-black/[0.04] dark:border-white/5 space-y-8 md:space-y-16 group relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-emerald-500/10" />
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-10 relative z-10">
              <div className="space-y-6 md:space-y-10">
                <div className="flex items-center gap-4 md:gap-8">
                  <div className="p-3.5 md:p-6 bg-black/[0.03] dark:bg-white/5 rounded-2xl md:rounded-[2.5rem] group-hover:scale-110 transition-transform duration-700 shadow-inner">
                    <WeatherIcon condition={loc.weather} size={32} className="md:w-12 md:h-12" />
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-6xl font-serif font-bold tracking-tight text-[var(--foreground)]">{loc.name}</h3>
                    <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] opacity-40 text-[var(--foreground)] mt-1">{loc.weather}</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-3 md:gap-4">
                  <span className="text-6xl md:text-9xl font-serif font-bold text-[var(--foreground)] tracking-tighter">{loc.temp}°</span>
                  <span className="text-xl md:text-4xl font-serif italic opacity-20 text-[var(--foreground)]">C</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 md:gap-24 pb-2 md:pb-4">
                <div className="space-y-1.5 md:space-y-3">
                  <div className="flex items-center gap-1.5 md:gap-3 opacity-40 text-[var(--foreground)]">
                    <Droplets size={12} className="md:w-[18px] md:h-[18px] text-emerald-600 dark:text-backwater-blue" />
                    <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em]">Humidity</span>
                  </div>
                  <p className="text-xl md:text-4xl font-serif font-bold text-[var(--foreground)]">{loc.humidity}%</p>
                </div>
                <div className="space-y-1.5 md:space-y-3">
                  <div className="flex items-center gap-1.5 md:gap-3 opacity-40 text-[var(--foreground)]">
                    <Wind size={12} className="md:w-[18px] md:h-[18px] text-emerald-600 dark:text-backwater-blue" />
                    <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em]">Wind</span>
                  </div>
                  <p className="text-xl md:text-4xl font-serif font-bold text-[var(--foreground)]">{loc.wind}</p>
                </div>
                <div className="space-y-1.5 md:space-y-3">
                  <div className="flex items-center gap-1.5 md:gap-3 opacity-40 text-[var(--foreground)]">
                    <Eye size={12} className="md:w-[18px] md:h-[18px] text-emerald-600 dark:text-backwater-blue" />
                    <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em]">Vis</span>
                  </div>
                  <p className="text-xl md:text-4xl font-serif font-bold text-[var(--foreground)]">{loc.visibility}</p>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-black/[0.06] dark:border-white/5 space-y-8 relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-30 text-[var(--foreground)]">Extended Forecast</p>
                <div className="h-[1px] flex-1 bg-black/[0.04] dark:bg-white/5 mx-10" />
              </div>
              <div className="flex justify-between max-w-2xl px-2">
                {loc.forecast.map((t, idx) => (
                  <div key={idx} className="space-y-6 text-center group/day cursor-default">
                    <p className="text-[10px] font-black opacity-30 uppercase text-[var(--foreground)] tracking-[0.3em]">Day {idx + 1}</p>
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-black/[0.02] dark:bg-white/5 rounded-2xl group-hover/day:bg-black/[0.05] transition-colors">
                        <WeatherIcon condition={idx === 0 ? loc.weather : (idx === 1 ? "cloudy" : "sunny")} size={28} className="opacity-80" />
                      </div>
                      <p className="text-3xl font-serif font-bold text-[var(--foreground)]">{t}°</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
