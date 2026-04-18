import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Compass, Map, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { db, doc, onSnapshot } from "@/lib/firebase";

interface Place {
  id: string;
  name: string;
  coords: [number, number];
  category: string;
  image: string;
  desc: string;
  isRouteStop: boolean;
  infoUrl?: string;
  isEvent?: boolean;
}

export default function RouteMap({ activePlanId = "4-day" }: { activePlanId?: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const routeData = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [activeMode, setActiveMode] = useState<"route" | "explore">("route");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  // Sync theme with DOM changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true
    });

    return () => observer.disconnect();
  }, []);

  // Refs for reactive access in map events (preventing stale closures)
  const placesRef = useRef<Place[]>(places);
  const themeRef = useRef<"light" | "dark">(theme);
  const activeModeRef = useRef<"route" | "explore">(activeMode);

  useEffect(() => { placesRef.current = places; }, [places]);
  useEffect(() => { themeRef.current = theme; }, [theme]);
  useEffect(() => { activeModeRef.current = activeMode; }, [activeMode]);


  // Fetch Dynamic Data from Firestore
  useEffect(() => {
    const planDoc = doc(db, "itineraries", activePlanId);
    console.log("Map: Subscribing to", activePlanId);
    
    const unsubscribe = onSnapshot(planDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log("Map Data Received:", data);
        
        // Gather Global Places
        const extractedPlaces: Place[] = (data.places || []).map((p: any) => ({
            id: p.id || `place-${Date.now()}-${Math.random()}`,
            name: p.name || "Untitled Place",
            coords: [Number(p.coords[0]), Number(p.coords[1])],
            category: p.category || "Landmark",
            image: p.image || "https://images.unsplash.com/photo-1593693397690-362cb9666fc2",
            desc: p.desc || "",
            isRouteStop: p.isRouteStop !== false,
            infoUrl: p.infoUrl || "",
            isEvent: false
        }));

        console.log("Extracted Map Points:", extractedPlaces);
        setPlaces(extractedPlaces);
      } else {
        console.warn("Map: Document does not exist in Firestore for ID:", activePlanId);
      }
    }, (error) => {
      console.error("Map Snapshot Error:", error);
    });

    return () => unsubscribe();
  }, [activePlanId]);

  // Update visibility without full rebuild
  const updateRouteVisibility = () => {
    if (!map.current || !map.current.getLayer("route-line")) return;
    map.current.setPaintProperty(
      "route-line",
      "line-opacity",
      activeModeRef.current === "route" ? 0.8 : 0
    );
  };

  const addMarkers = () => {
    if (!map.current) return;
    
    markers.current.forEach(m => m.remove());
    markers.current = [];

    const currentPlaces = placesRef.current;
    const currentMode = activeModeRef.current;
    const itemsToMark = currentMode === "route" ? currentPlaces.filter(p => p.isRouteStop) : currentPlaces;

    itemsToMark.forEach((stop: Place) => {
      if (!stop.coords || isNaN(stop.coords[0])) return;
      
      const isSelected = selectedPlace?.id === stop.id;
      const el = document.createElement("div");
      el.className = "w-0 h-0 flex items-center justify-center relative";

      const colorClass = stop.category === "Nature" ? "bg-emerald-500" :
                        stop.category === "Landmark" ? "bg-blue-500" :
                        stop.category === "Adventure" ? "bg-orange-500" :
                        stop.category === "Shopping" ? "bg-purple-500" :
                        stop.category === "Food" ? "bg-rose-500" : "bg-emerald-700";

      const isDarkMode = themeRef.current === "dark";
      
      el.innerHTML = `
        <div class="relative flex items-center justify-center transition-all duration-500 ${isSelected ? 'scale-125 z-20' : 'hover:scale-110'}">
          <div class="w-3.5 h-3.5 rounded-full ${colorClass} ring-2 ${isDarkMode ? 'ring-white/20' : 'ring-black/40'} shadow-lg relative"></div>
          <!-- Titles moved to native symbol layer for stability -->
        </div>
      `;
      
      el.onclick = (e) => {
        e.stopPropagation();
        setSelectedPlace(stop);
      };
      
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(stop.coords)
        .addTo(map.current!);
      
      markers.current.push(marker);
    });
  };

  const fetchRoute = async () => {
    if (!map.current || placesRef.current.length === 0) return;
    
    const routeStops = placesRef.current.filter(p => p.isRouteStop);
    if (routeStops.length < 2) return;

    const coordsString = routeStops.map(stop => `${stop.coords[0]},${stop.coords[1]}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?geometries=geojson&overview=full`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === "Ok" && data.routes?.[0]) {
        routeData.current = data.routes[0].geometry;
        const source = map.current.getSource("route") as maplibregl.GeoJSONSource;
        if (source) {
          source.setData({
            type: "Feature",
            properties: {},
            geometry: routeData.current
          });
        }
      }
    } catch (error) {
      console.error("Error fetching road route:", error);
    }
  };

  const fitMapToTrail = () => {
    if (!map.current || placesRef.current.length === 0) return;
    
    const bounds = new maplibregl.LngLatBounds();
    const currentMode = activeModeRef.current;
    
    // Use all places in explore mode, or just route stops in route mode
    const targets = currentMode === "route" ? placesRef.current.filter(p => p.isRouteStop) : placesRef.current;
    
    if (targets.length === 0) return;
    
    targets.forEach(p => {
      if (p.coords && !isNaN(p.coords[0])) {
        bounds.extend(p.coords);
      }
    });

    const isMobile = window.innerWidth < 768;
    map.current.fitBounds(bounds, {
      padding: isMobile 
        ? { top: 140, bottom: 100, left: 50, right: 50 } 
        : { top: 120, bottom: 100, left: 150, right: 150 },
      maxZoom: isMobile ? 11 : 12,
      duration: 2000
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const isDark = document.documentElement.classList.contains("dark");
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: isDark ? "https://tiles.openfreemap.org/styles/dark" : "https://tiles.openfreemap.org/styles/liberty",
      center: [76.5, 10.0], // Neutral starting point before bounds fit
      zoom: 7,
      attributionControl: false
    });

    // Safety Timeout for Load State
    const safetyTimeout = setTimeout(() => {
        if (!isMapLoaded) {
            console.warn("Map load timeout - forcing ready state");
            setIsMapLoaded(true);
        }
    }, 3000);

    const updateTitles = () => {
      if (!map.current) return;
      const currentPlaces = placesRef.current;
      const currentMode = activeModeRef.current;
      const currentTheme = themeRef.current;
      const itemsToMark = currentMode === "route" ? currentPlaces.filter(p => p.isRouteStop) : currentPlaces;

      const source = map.current.getSource("place-titles") as maplibregl.GeoJSONSource;
      if (source) {
          source.setData({
              type: "FeatureCollection",
              features: itemsToMark.map(p => ({
                  type: "Feature",
                  geometry: { type: "Point", coordinates: p.coords },
                  properties: { name: p.name.toUpperCase() }
              }))
          });
      } else {
          map.current.addSource("place-titles", {
              type: "geojson",
              data: {
                  type: "FeatureCollection",
                  features: itemsToMark.map(p => ({
                      type: "Feature",
                      geometry: { type: "Point", coordinates: p.coords },
                      properties: { name: p.name.toUpperCase() }
                  }))
              }
          });
      }

      if (!map.current.getLayer("place-titles")) {
          map.current.addLayer({
              id: "place-titles",
              type: "symbol",
              source: "place-titles",
              layout: {
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                  "text-size": 9,
                  "text-letter-spacing": 0.2,
                  "text-offset": [0, 1.5],
                  "text-anchor": "top",
                  "text-transform": "uppercase"
              },
              paint: {
                  "text-color": currentTheme === "dark" ? "#ffffff" : "#000000",
                  "text-halo-color": currentTheme === "dark" ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)",
                  "text-halo-width": 2,
                  "text-opacity": 1
              }
          });
      } else {
          map.current.setPaintProperty("place-titles", "text-color", currentTheme === "dark" ? "#ffffff" : "#000000");
          map.current.setPaintProperty("place-titles", "text-halo-color", currentTheme === "dark" ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)");
      }
    };

    const setupLayers = () => {
      if (!map.current) return;
      console.log("Map: Setting up layers & markers...");
      
      if (!map.current.getSource("route")) {
        map.current.addSource("route", {
            type: "geojson",
            data: routeData.current || { type: "FeatureCollection", features: [] }
          });
      }

      if (!map.current.getLayer("route-line")) {
        map.current.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#10b981",
              "line-width": 6,
              "line-dasharray": [1, 1],
              "line-opacity": activeModeRef.current === "route" ? 0.8 : 0
            }
          });
      }
      
      addMarkers();
      fetchRoute();
      updateTitles();
      
      // Auto-frame on first significant data load
      setTimeout(fitMapToTrail, 100);
    };

    // Use 'idle' for post-initialization stability
    map.current.once("idle", setupLayers);

    // Style load is still needed for runtime theme switches
    map.current.on("style.load", () => {
        console.log("Map: Style loaded, waiting for idle to restore layers...");
        map.current?.once("idle", setupLayers);
    });

    map.current.on("load", () => {
      clearTimeout(safetyTimeout);
      setIsMapLoaded(true);
      setupLayers();
      
      // Also expose updateTitles to be used in other effects
      (map.current as any)._updateTitles = updateTitles;
    });

    return () => {
      clearTimeout(safetyTimeout);
      markers.current.forEach(m => m.remove());
      map.current?.remove();
    };
  }, []);

  // Update Markers & Route when places or mode changes
  useEffect(() => {
    if (isMapLoaded && map.current) {
       // If setStyle was recently called, we might need to wait for idle again
       if (map.current.isStyleLoaded()) {
           addMarkers();
           fetchRoute();
           updateRouteVisibility();
           fitMapToTrail();
           if ((map.current as any)._updateTitles) (map.current as any)._updateTitles();
       } else {
           map.current.once('idle', () => {
              addMarkers();
              fetchRoute();
              updateRouteVisibility();
              fitMapToTrail();
              if ((map.current as any)._updateTitles) (map.current as any)._updateTitles();
           });
       }
    }
  }, [places, activeMode, isMapLoaded]);

  // Center on selected place
  useEffect(() => {
    if (selectedPlace && map.current) {
      const isMobile = window.innerWidth < 768;
      map.current.flyTo({
        center: selectedPlace.coords,
        zoom: activeMode === "explore" ? 12 : 9,
        speed: 1.2,
        curve: 1.42,
        // On mobile, use large bottom padding to push the pin into the upper viewport 
        // away from the expanded info card.
        padding: isMobile 
          ? { top: 80, bottom: 380, left: 50, right: 50 } 
          : { top: 100, bottom: 250, left: 100, right: 100 }
      });
    }
  }, [selectedPlace]);

  // Theme Observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Update Map Style when Theme changes
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(theme === "dark" ? "https://tiles.openfreemap.org/styles/dark" : "https://tiles.openfreemap.org/styles/liberty");
      // Markers will be re-added by the style.load event in the initialization useEffect
    }
  }, [theme]);

  return (
    <div className="relative w-full space-y-12 md:space-y-16">
        {/* Desktop Header */}
        <div className="hidden md:flex flex-row items-end justify-between px-4 md:px-0">
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.5em] opacity-40 text-[var(--foreground)] text-left">The Expedition</p>
            <h2 className="text-4xl md:text-6xl font-serif font-bold italic tracking-tighter text-[var(--foreground)] text-left">Interactive Trail</h2>
          </div>
          <div className="pb-2">
            <div className="glass p-1.5 rounded-full flex items-center gap-1">
              <button 
                onClick={() => { setActiveMode("route"); setSelectedPlace(null); }}
                className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", 
                  activeMode === "route" 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20" 
                    : theme === "dark" ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"
                )}
              >Route</button>
              <button 
                onClick={() => setActiveMode("explore")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  activeMode === "explore" 
                    ? (theme === "dark" ? "bg-white text-black shadow-xl scale-105" : "bg-emerald-600 text-white shadow-xl scale-105")
                    : (theme === "dark" ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black")
                )}
              >
                Explore
              </button>
            </div>
          </div>
        </div>

        {/* Empty State Overlay */}
        {places.length === 0 && isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[32px] max-w-sm text-center space-y-4 shadow-2xl pointer-events-auto">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-white">No Trail Points Set</h3>
                <p className="text-[10px] text-white/40 leading-relaxed">Add coordinates to your events in the Super Admin to see them on the map.</p>
              </div>
            </div>
          </div>
        )}

      {/* Immersive Map Container */}
      <div className="relative h-[100dvh] md:h-[750px] w-full md:rounded-[4rem] overflow-hidden md:border border-black/[0.05] dark:border-white/5 md:shadow-2xl selection:bg-none mb-12 md:mb-20">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full touch-none" />
        
        {/* Mobile Header Overlay */}
        <div className="md:hidden absolute top-0 left-0 right-0 p-8 pt-12 z-20 pointer-events-none bg-gradient-to-b from-[var(--background)] via-[var(--background)]/80 to-transparent">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--foreground)] opacity-40">The Expedition</p>
          <h2 className="text-4xl font-serif font-bold italic tracking-tighter text-[var(--foreground)]">Interactive Trail</h2>
          
          <div className="flex mt-6 pointer-events-auto">
            <div className="glass p-1 rounded-full flex items-center gap-0.5">
              <button 
                onClick={() => { setActiveMode("route"); setSelectedPlace(null); }}
                className={cn("px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all", activeMode === "route" ? "bg-emerald-600 text-white" : theme === "dark" ? "opacity-40" : "text-black opacity-40")}
              >Route</button>
              <button 
                onClick={() => setActiveMode("explore")}
                className={cn("px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all", activeMode === "explore" ? "bg-emerald-600 text-white" : theme === "dark" ? "opacity-40" : "text-black opacity-40")}
              >Explore</button>
            </div>
          </div>
        </div>

        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)] z-50">
            <div className="flex flex-col items-center gap-6">
              <Compass size={64} className="animate-spin text-emerald-600 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 animate-pulse">Initializing Trail Intel...</p>
            </div>
          </div>
        )}

        {/* Selected Place Detail Card - Now Swipable */}
        <AnimatePresence mode="wait">
          {selectedPlace && (
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="absolute left-4 right-4 bottom-26 md:left-12 md:bottom-12 md:w-96 z-[60]"
            >
              <div className="glass frost-max p-5 rounded-[2.5rem] shadow-2xl space-y-5 relative overflow-hidden group">
                <button onClick={() => setSelectedPlace(null)} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors text-white">
                  <X size={14} />
                </button>
                
                <motion.div 
                  key={selectedPlace.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    const threshold = 50;
                    const currentIndex = places.findIndex(p => p.id === selectedPlace.id);
                    if (info.offset.x < -threshold && currentIndex < places.length - 1) {
                      setSelectedPlace(places[currentIndex + 1]);
                    } else if (info.offset.x > threshold && currentIndex > 0) {
                      setSelectedPlace(places[currentIndex - 1]);
                    }
                  }}
                >
                  <div className="h-32 md:h-44 -mx-5 -mt-5 relative overflow-hidden">
                    <img src={selectedPlace.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-5">
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[7px] font-black uppercase tracking-widest">{selectedPlace.category}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-xl font-serif font-bold text-[var(--foreground)]">{selectedPlace.name}</h4>
                    <p className="text-[11px] leading-relaxed opacity-60 text-[var(--foreground)]">{selectedPlace.desc}</p>
                  </div>
                  
                  {/* Visual Swipe Hint */}
                  <div className="flex justify-center gap-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
                    {places.slice(0, 10).map((_, i) => (
                      <div key={i} className={cn("w-1 h-1 rounded-full bg-[var(--foreground)]", i === places.findIndex(p => p.id === selectedPlace.id) ? "scale-150 opacity-100" : "opacity-50")} />
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
 
        {/* Discovery Scroller */}
        <div className={cn("absolute left-0 right-0 bottom-26 md:bottom-8 z-[60] transition-all px-6", (activeMode === "explore" && !selectedPlace) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none")}>
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x">
            {places.map((place) => (
              <button key={place.id} onClick={() => setSelectedPlace(place)} className={cn(
                "flex-shrink-0 snap-center p-3.5 rounded-[2rem] shadow-2xl flex items-center gap-3 border transition-all hover:scale-105 active:scale-95 w-64 md:w-60 frost-max",
                theme === "dark" ? "dark" : "light"
              )}>
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"><img src={place.image} className="w-full h-full object-cover" /></div>
                <div className="text-left overflow-hidden">
                  <p className="text-[7px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">{place.category}</p>
                  <p className="text-xs font-serif font-bold text-[var(--foreground)] truncate">{place.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
