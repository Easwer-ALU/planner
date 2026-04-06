"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Train, Ship, Utensils, Sunset, Coffee, Car, Leaf, 
  Home, Camera, Megaphone, Sunrise, Map, 
  Landmark, Navigation, Waves, Bird, Mountain 
} from "lucide-react";

const itineraries: any = {
// Inside your itineraries object, update the "4-day" key:
"4-day": [
  {
    id: "alleppey-4",
    tabLabel: "Day 1",
    title: "The Backwater Bliss",
    events: [
      { icon: Train, time: "09:30 AM", cardTitle: "Alleppey Arrival", desc: "Arrival at Alleppey Station. Private transfer to the jetty for houseboat boarding.", photoIndex: 0 },
      { icon: Ship, time: "11:30 AM", cardTitle: "Private Villa Boarding", desc: "Check-in to your 4-bedroom houseboat.", photoIndex: 1 },
      { icon: Utensils, time: "01:30 PM", cardTitle: "Monsoon Cruise", desc: "Navigate Vembanad Lake. The covered deck is perfect for music and seafood lunch.", photoIndex: 2 },
      { icon: Sunset, time: "05:30 PM", cardTitle: "Hidden Canal Shikara", desc: "A 1-hour sunset cruise through the narrowest backwater arteries.", photoIndex: 3 },
    ],
    photos: ["/allepey.jpg", "/houseboat.webp", "/meal.jpg", "/shikara.jpg"]
  },
  {
    id: "munnar-4",
    tabLabel: "Day 2",
    title: "The Tea Highlands",
    events: [
      { icon: Car, time: "10:00 AM", cardTitle: "Self-Drive Pickup", desc: "Pick up two rental cars at the jetty. Begin the 5-hour scenic climb to Munnar.", photoIndex: 0 },
      { icon: Utensils, time: "01:30 PM", cardTitle: "Highland Lunch", desc: "Roadside stop for Kerala Beef Fry or Spicy Chicken Curry.", photoIndex: 1 },
      { icon: Landmark, time: "04:30 PM", cardTitle: "KDHP Tea Museum", desc: "Indoor history tour of the tea estates—perfect for the afternoon mist.", photoIndex: 2 },
      { icon: Home, time: "07:00 PM", cardTitle: "Munnar Stay", desc: "Check-in at a cozy homestay surrounded by tea gardens.", photoIndex: 3 },
    ],
    photos: ["/drive.jpg", "/spice.jpg", "/tea.jpg", "/cottage.jpg"]
  },
  {
    id: "adventure-4",
    tabLabel: "Day 3",
    title: "Adventure & Shift",
    events: [
      { icon: Mountain, time: "11:30 AM", cardTitle: "Ripple Adventures", desc: "Ziplining and river crossing through the drizzle. Epic valley views.", photoIndex: 0 },
      { icon: Car, time: "02:30 PM", cardTitle: "The Big Shift", desc: "Drive from Munnar down to the coast of Kochi. Stop by sights along the way.", photoIndex: 1 },
      { icon: Landmark, time: "07:30 PM", cardTitle: "Kochi Arrival", desc: "Check-in at the heritage stay followed by dinner and walk.", photoIndex: 2 },
    ],
    photos: ["/ripple.webp", "/lockhart.jpg", "/fort.jpg"]
  },
  {
    id: "kochi-4",
    tabLabel: "Day 4",
    title: "Heritage & Return",
    events: [
      { icon: Landmark, time: "11:30 AM", cardTitle: "Fort Kochi Tour", desc: "Chinese Fishing Nets and St. Francis Church. Last-minute Jew Town shopping.", photoIndex: 0 },
      { icon: Utensils, time: "01:00 PM", cardTitle: "Seafood Lunch", desc: "Spicy local seafood at Fusion Bay or Kerala Cafe.", photoIndex: 1 },
      { icon: Train, time: "06:00 PM", cardTitle: "Mattanchery Palace", desc: "Explore the historic palace and its surroundings.", photoIndex: 2 },
      { icon: Train, time: "06:45 PM", cardTitle: "Station Departure", desc: "Board Train for the overnight journey back home.", photoIndex: 3 },
    ],
    photos: ["/nets.jpg", "/lunch.jpg", "/palace.jpg", "/departure.png"]
  }
],
  "5-day": [
    {
      id: "alleppey-5",
      tabLabel: "Day 1",
      title: "Backwater Heart",
      events: [
        { icon: Train, time: "09:30 AM", cardTitle: "Arrival", desc: "Check into a heritage homestay and prepare for a day on the water.", photoIndex: 0 },
        { icon: Map, time: "01:30 PM", cardTitle: "Private Shikara", desc: "3-hour cruise through neon-green narrow canals.", photoIndex: 1 },
        { icon: Waves, time: "05:00 PM", cardTitle: "Alleppey Beach", desc: "Relax by the old pier and enjoy a coastal monsoon sunset.", photoIndex: 2 },
      ],
      photos: ["https://images.unsplash.com/photo-1593693397690-362cb9666fc2", "/dayboat.jpg","/beach.webp"]
    },
    {
      id: "thekkady-5",
      tabLabel: "Day 2",
      title: "Wildlife & Spices",
      events: [
        { icon: Leaf, time: "02:30 PM", cardTitle: "Spice Plantation", desc: "Guided walk through cardamom gardens before the afternoon safari.", photoIndex: 0 },
        { icon: Ship, time: "03:30 PM", cardTitle: "Periyar Safari", desc: "Afternoon boat session—peak time for bison and elephant sightings.", photoIndex: 1 },
      ],
      photos: ["/spice.jpg", "/periyar.jpg"]
    },
    {
      id: "munnar-5",
      tabLabel: "Day 3",
      title: "Emerald Hills",
      events: [
        { icon: Camera, time: "01:00 PM", cardTitle: "Rose Garden", desc: "Terraced gardens with millions of blooms in the mountain air.", photoIndex: 0 },
        { icon: Coffee, time: "02:00 PM", cardTitle: "Tea Museum", desc: "Explore the heritage of tea making and sample local brews.", photoIndex: 1 },
        { icon: Megaphone, time: "03:30 PM", cardTitle: "Lakeside Circuit", desc: "Mattupetty Dam, Echo Point, and Kundale Lake.", photoIndex: 2 },
      ],
      photos: ["/rose.webp", "/tea.jpg", "/dam.jpg"]
    },
    {
      id: "falls-5",
      tabLabel: "Day 4",
      title: "Falls & Shopping",
      events: [
        { icon: Sunrise, time: "05:30 AM", cardTitle: "Sunrise View", desc: "Catch the dawn at Pothamedu Viewpoint before leaving the hills.", photoIndex: 0 },
        { icon: Waves, time: "02:00 PM", cardTitle: "Athirappilly Falls", desc: "Marvel at Kerala's largest waterfall at its monsoon peak.", photoIndex: 1 },
        { icon: Landmark, time: "07:00 PM", cardTitle: "LuLu Mall Kochi", desc: "Visit one of India's largest malls for dinner and some shopping.", photoIndex: 2 },
      ],
      photos: ["/sunrise.jpg","/falls.jpg","/lulu.jpg"]
    },
    {
      id: "jatayu-5",
      tabLabel: "Day 5",
      title: "Heritage & Giants",
      events: [
        { icon: Landmark, time: "09:00 AM", cardTitle: "Fort Kochi", desc: "Mattancherry Palace murals and the historic Paradesi Synagogue.", photoIndex: 0 },
        { icon: Bird, time: "03:30 PM", cardTitle: "Jatayu Center", desc: "Cable car ride to see the world's largest bird sculpture.", photoIndex: 1 },
        { icon: Train, time: "06:30 PM", cardTitle: "Departure", desc: "Transfer to Kollam Junction for the night train to Chennai.", photoIndex: 2 },
      ],
      photos: ["/fort.jpg","/jatayu.jpg","/departure.png"]
    }
  ]
};

export default function Itinerary({ planType }: { planType: string }) {
  const currentData = itineraries[planType] || itineraries["4-day"];
  const [activeTab, setActiveTab] = useState(currentData[0].id);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInternalScroll = useRef(false);

  useEffect(() => {
    setActiveTab(currentData[0].id);
    setActiveEventIndex(0);
  }, [planType, currentData]);

  useEffect(() => {
    if (scrollContainerRef.current && isInternalScroll.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.clientWidth;
      container.scrollTo({
        left: activeEventIndex * cardWidth,
        behavior: "smooth",
      });
      setTimeout(() => { isInternalScroll.current = false; }, 500);
    }
  }, [activeEventIndex]);

  const handleScroll = () => {
    if (scrollContainerRef.current && !isInternalScroll.current) {
      const container = scrollContainerRef.current;
      const index = Math.round(container.scrollLeft / container.clientWidth);
      if (index !== activeEventIndex) {
        setActiveEventIndex(index);
      }
    }
  };

  const activeDayData = currentData.find((day: any) => day.id === activeTab);

  return (
    <section id="itinerary-section" className="relative py-16 md:py-32 bg-[#F9F8F6] text-[#1A3326] w-full min-h-screen font-sans">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Day Tabs: Responsive wrap */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-16 md:mb-24 bg-white/40 backdrop-blur-xl p-2 md:p-3 rounded-[2rem] md:rounded-[2.5rem] w-fit mx-auto border border-white/20 shadow-xl shadow-[#1A3326]/5">
          {currentData.map((day: any) => (
            <button
              key={day.id}
              onClick={() => {
                setActiveTab(day.id);
                setActiveEventIndex(0);
              }}
              className={`relative px-5 md:px-8 py-2 md:py-3 text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] rounded-full transition-all duration-500 z-10 ${
                activeTab === day.id ? "text-[#1A3326]" : "text-[#1A3326]/40 hover:text-[#1A3326]"
              }`}
            >
              {activeTab === day.id && (
                <motion.div layoutId="itineraryTab" className="absolute inset-0 bg-[#E6A83C] rounded-full -z-10 shadow-lg shadow-[#E6A83C]/30" />
              )}
              {day.tabLabel}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeDayData && (
            <motion.div key={activeDayData.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid lg:grid-cols-12 gap-10 md:gap-16 lg:gap-24 items-start">
              
              {/* Left: Timeline */}
              <div className="lg:col-span-5 relative">
                <div className="mb-8 md:mb-12">
                  <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-[#E6A83C]">Expedition Journal</span>
                  <h3 className="font-serif text-4xl md:text-7xl font-bold mt-2 md:mt-3 text-[#1A3326] leading-[1.1]">{activeDayData.title}</h3>
                </div>
                
                <div className="space-y-8 md:space-y-12 relative before:absolute before:inset-0 before:ml-[1.15rem] before:h-full before:w-[2px] before:bg-[#1A3326]/5">
                  {activeDayData.events.map((event: any, i: number) => {
                    const isActive = activeEventIndex === i;
                    return (
                      <div 
                        key={i} 
                        className="relative flex gap-6 md:gap-8 group cursor-pointer"
                        onMouseEnter={() => {
                            isInternalScroll.current = true;
                            setActiveEventIndex(i);
                        }}
                      >
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 z-10 transition-all duration-500 shadow-sm ${
                            isActive 
                            ? 'bg-[#E6A83C] text-white scale-110 md:scale-125 shadow-xl shadow-[#E6A83C]/20 border-none' 
                            : 'bg-white border border-[#1A3326]/10 text-[#1A3326]/40'
                        }`}>
                          <event.icon size={16} strokeWidth={2} />
                        </div>

                        <div className="pt-1">
                          <div className={`font-sans font-black text-[9px] md:text-[10px] uppercase tracking-[0.25em] transition-colors duration-500 ${isActive ? 'text-[#E6A83C]' : 'text-[#1A3326]/40'}`}>
                            {event.time}
                          </div>
                          <div className={`text-xl md:text-2xl font-bold tracking-tight transition-all duration-500 ${isActive ? 'text-[#1A3326]' : 'text-[#1A3326]/60'}`}>
                            {event.cardTitle}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Swipeable Card (Height adjusted for mobile) */}
              <div className="lg:col-span-7 relative h-[560px] md:h-[760px] lg:sticky lg:top-12 bg-white/80 backdrop-blur-sm rounded-[2.5rem] md:rounded-[4rem] border border-white shadow-[0_40px_120px_-20px_rgba(26,51,38,0.15)] overflow-hidden">
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar cursor-grab active:cursor-grabbing"
                >
                  {activeDayData.events.map((event: any, i: number) => (
                    <div key={i} className="min-w-full h-full snap-center flex flex-col">
                      <div className="w-full h-[55%] md:h-[62%] p-4 md:p-8">
                         <div className="w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden relative group shadow-inner">
                            <img src={activeDayData.photos[event.photoIndex] || activeDayData.photos[0]} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110 ease-out" alt={event.cardTitle} />
                            <div className="absolute top-4 right-4 md:top-8 md:right-8 bg-white/95 backdrop-blur-md px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[9px] md:text-[11px] font-black tracking-widest text-[#1A3326] uppercase border border-white shadow-xl">
                               <Navigation size={14} className="inline mr-1 md:mr-2 text-[#E6A83C]"/> {event.time}
                            </div>
                         </div>
                      </div>

                      <div className="px-8 md:px-16 pb-12 md:pb-16 flex-1 flex flex-col justify-center">
                        <h4 className="font-serif text-3xl md:text-5xl font-bold text-[#1A3326] mb-3 md:mb-6 leading-tight">{event.cardTitle}</h4>
                        <p className="text-[#1A3326]/50 text-base md:text-xl leading-relaxed max-w-lg italic font-medium">{event.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-8 md:bottom-12 left-8 md:left-16 flex gap-3">
                   {activeDayData.events.map((_: any, i: number) => (
                     <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${activeEventIndex === i ? 'w-10 md:w-12 bg-[#E6A83C]' : 'w-3 bg-[#1A3326]/10'}`} />
                   ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}