"use client";

import { useState, useEffect } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// 1. MARKERS: Only the 5 main daily destinations
const markerData: any = {
  "4-day": [
    { name: "Alleppey", coords: [76.3264, 9.4981] },
    
    { name: "Munnar", coords: [77.0595, 10.0889] },
    { name: "Kochi", coords: [76.2673, 9.9312] },
  ],
  "5-day": [
    { name: "Alleppey", coords: [76.3264, 9.4981] },
    { name: "Thekkady", coords: [77.1396, 9.6062] },
    { name: "Munnar", coords: [77.0595, 10.0889] },
    { name: "Kochi", coords: [76.2673, 9.9312] },
    { name: "Athirappilly", coords: [76.5483, 10.2886] }, // The "Finale" Pin
  ]
};

// 2. ROUTE WAYPOINTS: Every single place the car actually goes
const routeWaypoints: any = {
  "4-day": [
    [76.3264, 9.4981],  [77.0595, 10.0889], [76.2673, 9.9312]
  ],
  "5-day": [
    [76.3264, 9.4981], // Alleppey
    [77.1396, 9.6062], // Thekkady
    [77.0595, 10.0889], // Munnar
    [76.2673, 9.9312], // Kochi
    [76.8672, 8.8658], // Jatayu (The road goes here...)
    [76.5483, 10.2886]  // ...then ends at Athirappilly
  ]
};

export default function RouteMap({ planType }: { planType: string }) {
  const [hoverInfo, setHoverInfo] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<any>(null);

  const markers = markerData[planType] || markerData["4-day"];
  const waypoints = routeWaypoints[planType] || routeWaypoints["4-day"];

  const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const ORS_KEY = process.env.NEXT_PUBLIC_ORS_KEY;
  const mapStyle = `https://api.maptiler.com/maps/landscape/style.json?key=${MAPTILER_KEY}`;

  useEffect(() => {
    if (!ORS_KEY) return;

    const fetchRoute = async () => {
      try {
        const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": ORS_KEY },
          body: JSON.stringify({ coordinates: waypoints })
        });
        const data = await response.json();
        setRouteData(data);
      } catch (err) {
        console.error("Routing Error:", err);
      }
    };
    fetchRoute();
  }, [planType, ORS_KEY, waypoints]);

  if (!MAPTILER_KEY || !ORS_KEY) return null;

  return (
    <section className="py-24 bg-white w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center mb-12 text-center">
          <span className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-3">The Geography</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {planType === '5-day' ? "Icons of Kerala Trail" : "The Monsoon Road Trip"}
          </h2>
        </div>

        <div className="w-full h-[600px] rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 relative z-0">
          <Map
            key={planType}
            initialViewState={{ 
              longitude: 76.7, 
              latitude: 9.6, // Adjusted slightly to fit the southern Jatayu loop
              zoom: planType === '5-day' ? 7.2 : 7.8, 
              pitch: 45 
            }}
            mapStyle={mapStyle}
          >
            {routeData && (
              <Source id="route" type="geojson" data={routeData}>
                <Layer
                  id="route-line"
                  type="line"
                  paint={{ 'line-color': '#d97706', 'line-width': 4, 'line-opacity': 0.8 }}
                />
              </Source>
            )}

            {markers.map((stop: any, index: number) => (
              <Marker key={`${planType}-${stop.name}`} longitude={stop.coords[0]} latitude={stop.coords[1]} anchor="center">
                <div 
                  className="relative flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setHoverInfo(stop.name)}
                  onMouseLeave={() => setHoverInfo(null)}
                >
                  <div className="absolute bottom-full mb-3 bg-white text-gray-900 border border-gray-200 text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-md z-10">
                    Day {index + 1}: <span className="text-amber-600">{stop.name}</span>
                  </div>
                  <div className="w-7 h-7 bg-amber-500 text-white rounded-full border-[3px] border-white shadow-lg flex items-center justify-center text-xs font-bold transition-all">
                    {index + 1}
                  </div>
                </div>
              </Marker>
            ))}
          </Map>
        </div>
      </div>
    </section>
  );
}