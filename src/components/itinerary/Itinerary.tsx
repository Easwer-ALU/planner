import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { db, doc, onSnapshot } from "@/lib/firebase";
import { 
  Navigation, Clock, Train, Ship, Utensils, Sunset, Coffee, Car, Leaf, 
  Home, Camera, Megaphone, Sunrise, MapIcon, 
  Landmark, Waves, Bird, Mountain
} from "lucide-react";

export const IconMap: Record<string, any> = {
  Train, Ship, Utensils, Sunset, Coffee, Car, Leaf,
  Home, Camera, Megaphone, Sunrise, Map: MapIcon,
  Landmark, Navigation, Waves, Bird, Mountain
};

export default function Itinerary({ planType = "4-day" }: { planType?: string }) {
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [interactionSource, setInteractionSource] = useState<"scroll" | "interaction">("scroll");
  const eventRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset indices when plan type changes to avoid out-of-bounds errors and fetch new data
  useEffect(() => {
    setActiveDay(0);
    setActiveEventIndex(0);
    setLoading(true);

    const planDoc = doc(db, "itineraries", planType);
    const unsubscribe = onSnapshot(planDoc, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentData(snapshot.data().days || []);
      } else {
        setCurrentData([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [planType]);

  // Sync scroll on Interaction (Swipe) - MOBILE ONLY
  useEffect(() => {
    if (interactionSource === "interaction" && eventRefs.current[activeEventIndex] && isMobile) {
        eventRefs.current[activeEventIndex]?.scrollIntoView({ 
            behavior: "smooth", 
            block: "center" 
        });
        // Reset to scroll source after a delay to allow the animation to finish
        const timer = setTimeout(() => setInteractionSource("scroll"), 1000);
        return () => clearTimeout(timer);
    }
  }, [activeEventIndex, interactionSource, isMobile]);

  // Scroll Sync Logic: Intersection Observer for "Hot Zone" detection
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px -49% 0px", // Precise trigger line at the center of the viewport
      threshold: 0,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute("data-index"));
          if (!isNaN(index) && interactionSource === "scroll") {
            setActiveEventIndex(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Filter out null refs and observe
    eventRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [activeDay, planType, currentData]); // Re-observe when day or plan changes

  if (loading) {
    return (
      <div className="py-20 flex justify-center w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 dark:border-backwater-blue"></div>
      </div>
    );
  }

  // Defensive check for current day data
  const dayData = currentData[activeDay] || currentData[0];
  if (!dayData) {
     return (
        <div className="py-20 flex justify-center w-full text-center opacity-40 uppercase tracking-widest text-[10px] font-black text-[var(--foreground)]">
          No itinerary days found for this version.
        </div>
     );
  }

  return (
    <div className="space-y-16">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40 text-[var(--foreground)]">The Journey</p>
          <h2 className="text-5xl md:text-6xl font-serif font-bold italic tracking-tight text-[var(--foreground)]">Daily Expeditions</h2>
        </div>
        
        {/* Day Selector */}
        <div className="flex gap-3 p-2 glass rounded-full w-fit">
          {currentData.map((day: any, i: number) => (
            <button
              key={day.id}
              onClick={() => {
                setActiveDay(i);
                setActiveEventIndex(0);
                setInteractionSource("interaction");
              }}
              className={cn(
                "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                activeDay === i 
                  ? "bg-emerald-700 text-white dark:bg-backwater-blue shadow-xl shadow-emerald-700/20 dark:shadow-backwater-blue/20 scale-105" 
                  : "opacity-40 hover:opacity-100 text-[var(--foreground)]"
              )}
            >
              Day {i + 1}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${planType}-${activeDay}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="flex flex-col lg:grid lg:grid-cols-2 gap-12 md:gap-16 items-start"
        >
          <div 
            className={cn(
              "order-first lg:order-last w-full relative aspect-[16/10] lg:aspect-[4/5] rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden glass group sticky top-4 lg:top-32 shadow-2xl transition-all duration-700 z-20 bg-black isolate",
              !isMobile && "hover:transform-none" // Disable all tilt on desktop
            )}
            style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }} // Fix clipping issues on some browsers
          >
            {/* Sliding Track for "Continuous Reel" feel */}
            <motion.div 
              animate={{ x: `-${activeEventIndex * 100}%` }}
              transition={{ duration: 0.85, ease: [0.19, 1, 0.22, 1] }} // Smoother cinematic motion
              className="absolute inset-0 flex w-full h-full cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: -((dayData.events.length - 1) * 100), right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                const threshold = 50;
                if (info.offset.x < -threshold && activeEventIndex < dayData.events.length - 1) {
                  setInteractionSource("interaction");
                  setActiveEventIndex(prev => prev + 1);
                } else if (info.offset.x > threshold && activeEventIndex > 0) {
                  setInteractionSource("interaction");
                  setActiveEventIndex(prev => prev - 1);
                }
              }}
            >
              {dayData.events.map((evt: any, idx: number) => {
                const imgUrl = dayData.photos[evt.photoIndex] || dayData.photos[0];
                const optimizedUrl = `${imgUrl}${imgUrl.includes('?') ? '&' : '?'}auto=format&fit=crop&q=80&w=1200`;
                return (
                  <div key={idx} className="w-full h-full flex-shrink-0 relative overflow-hidden">
                    <img 
                      src={optimizedUrl} 
                      alt=""
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-opacity duration-1000"
                    />
                  </div>
                );
              })}
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
            
            {/* Visual Header Over Photo */}
            <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 right-6 md:right-12 space-y-2 md:space-y-4 pointer-events-none">
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-white/50">Day {activeDay + 1} Snapshot</p>
              <h3 className="text-2xl md:text-5xl font-serif font-bold text-white leading-tight tracking-tight">
                {dayData.events[activeEventIndex]?.cardTitle || dayData.title}
              </h3>
              <div className="flex items-center gap-3 text-white/80 text-[10px] md:text-sm font-bold pt-3 md:pt-6 border-t border-white/10 uppercase tracking-widest">
                <Navigation size={14} className="text-coconut-sunset dark:text-backwater-amber md:w-5 md:h-5" />
                <span>{dayData.title}</span>
              </div>
            </div>

            {/* Swipe Indicator Overlay (Mobile) */}
            <div className="absolute top-6 right-6 lg:hidden flex items-center gap-2 px-3 py-1.5 glass rounded-full opacity-40 pointer-events-none">
              <span className="text-[8px] font-black uppercase tracking-widest text-white italic">Swipe Snapshot</span>
            </div>
          </div>

          {/* Timeline List */}
          <div className="w-full space-y-4 relative px-0 md:pr-4">
            {/* Aesthetic Timeline Line: Centered behind icons */}
            <div className="absolute left-[34px] md:left-[32px] top-0 bottom-0 w-[2px] bg-black/[0.04] dark:bg-white/5" />
            
            {dayData.events.map((event: any, i: number) => (
              <motion.div 
                key={i}
                ref={(el) => (eventRefs.current[i] = el)}
                data-index={i}
                onClick={() => {
                  setInteractionSource("interaction");
                  setActiveEventIndex(i);
                }}
                className={cn(
                  "flex gap-4 md:gap-8 relative group cursor-pointer transition-all duration-700 rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 border border-transparent",
                  activeEventIndex === i ? "bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.02] dark:border-white/5 shadow-inner" : "opacity-40 hover:opacity-100"
                )}
              >
                {/* Timeline Icon Marker: Centered on line */}
                <div className={cn(
                  "w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 z-10 transition-all duration-700 shadow-xl",
                  activeEventIndex === i 
                    ? "bg-emerald-700 text-white dark:bg-backwater-blue scale-110 shadow-emerald-700/30 dark:shadow-backwater-blue/30" 
                    : "glass bg-black/[0.03] dark:bg-white/5 text-[var(--foreground)] border border-black/[0.03] dark:border-white/10 shadow-lg"
                )}>
                  {(() => {
                    const IconComponent = IconMap[event.icon] || Clock;
                    return <IconComponent size={22} className="md:w-7 md:h-7" />;
                  })()}
                </div>
                
                <div className="space-y-3 py-1 md:py-2">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-coconut-sunset dark:text-backwater-amber">
                      <Clock size={14} /> {event.time}
                    </span>
                  </div>
                  <h4 className="text-xl md:text-3xl font-serif font-bold leading-tight text-[var(--foreground)]">{event.cardTitle}</h4>
                  <p className="text-xs md:text-sm font-medium opacity-60 leading-relaxed max-w-sm text-[var(--foreground)]">{event.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
