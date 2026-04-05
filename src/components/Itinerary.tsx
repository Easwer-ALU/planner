"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Train, Ship, Utensils, Sunset, Coffee, Car, Leaf, 
  Home, Camera, Megaphone, Sunrise, Map, 
  Landmark, Navigation, Waves, Bird, Mountain 
} from "lucide-react";

const itineraries: any = {
  "4-day": [
    {
      id: "alleppey-4",
      tabLabel: "Day 1",
      title: "The Backwater Bliss",
      events: [
        { icon: Train, time: "10:30 AM", cardTitle: "Alleppey Arrival", desc: "Arrival at Alleppey Station from Chennai. Private transfer to the jetty.", photoIndex: 0 },
        { icon: Ship, time: "11:00 AM", cardTitle: "Houseboat Check-in", desc: "Board your private 4-bedroom floating villa. Settle in as the cruise begins.", photoIndex: 1 },
        { icon: Utensils, time: "12:30 PM", cardTitle: "Kerala Feast", desc: "Lunch with a great view of the backwaters. Fresh fish can be booked.", photoIndex: 2 },
        { icon: Sunset, time: "06:00 PM", cardTitle: "Sunset Shikara Ride", desc: "Switch to a small Shikara to navigate the narrow 'hidden' canals.", photoIndex: 3 },
      ],
      photos: ["/allepey.jpg", "/houseboat.webp", "/meal.jpg", "/shikara.jpg"]
    },
    {
      id: "thekkady-4",
      tabLabel: "Day 2",
      title: "Into the Wild",
      events: [
        { icon: Car, time: "09:30 AM", cardTitle: "Highland Drive", desc: "Scenic 4-hour climb into the spice hills of Kumily.", photoIndex: 0 },
        { icon: Leaf, time: "02:30 PM", cardTitle: "Spice Plantation Tour", desc: "A sensory walk through fresh cardamom, pepper, and cinnamon gardens.", photoIndex: 1 },
        { icon: Ship, time: "03:30 PM", cardTitle: "Periyar Boat Safari", desc: "Catch the late afternoon boat on Lake Periyar to spot wild elephants.", photoIndex: 2 },
        { icon: Home, time: "Night", cardTitle: "Homestay Rest", desc: "Dinner and overnight stay at a cozy Thekkady homestay.", photoIndex: 3 },
      ],
      photos: ["/drive.jpg", "/spice.jpg", "/periyar.jpg", "/cottage.jpg"]
    },
    {
      id: "munnar-4",
      tabLabel: "Day 3",
      title: "Emerald Hills",
      events: [
        { icon: Mountain, time: "08:00 AM", cardTitle: "Lockhart Gap Road", desc: "3.5-hour journey to Munnar via the breathtaking Lockhart Gap views.", photoIndex: 0 },
        { icon: Camera, time: "01:00 PM", cardTitle: "Rose Garden", desc: "A terraced paradise perfect for group photos among millions of blooms.", photoIndex: 1 },
        { icon: Coffee, time: "02:00 PM", cardTitle: "Tea Museum Visit", desc: "Learn the history of 'Black Gold' and see heritage tea machinery.", photoIndex: 2 },
        { icon: Megaphone, time: "03:30 PM", cardTitle: "Lakeside Circuit", desc: "Explore Mattupetty Dam, Echo Point, and Kundale Lake.", photoIndex: 3 },
      ],
      photos: ["/lockhart.jpg", "/rose.webp", "/tea.jpg", "/dam.jpg"]
    },
    {
      id: "kochi-4",
      tabLabel: "Day 4",
      title: "Heritage & Sunsets",
      events: [
        { icon: Sunrise, time: "05:30 AM", cardTitle: "Roadside Sunrise", desc: "Catch the sun rising over mist-covered valleys at Pothamedu Viewpoint.", photoIndex: 0 },
        { icon: Landmark, time: "02:30 PM", cardTitle: "Fort Kochi Heritage", desc: "Visit Mattancherry Palace and the historic Paradesi Synagogue.", photoIndex: 1 },
        { icon: Sunset, time: "05:00 PM", cardTitle: "Chinese Fishing Nets", desc: "Final sunset walk by the iconic nets before heading to the station.", photoIndex: 2 },
        { icon: Train, time: "09:00 PM", cardTitle: "Chennai Departure", desc: "Drop at Ernakulam Junction for the night train back home.", photoIndex: 3 },
      ],
      photos: ["/sunrise.jpg", "/fort.jpg", "/nets.jpg", "/departure.png"]
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