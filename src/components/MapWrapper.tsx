"use client";

import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { 
  ssr: false,
  loading: () => (
    <section className="py-24 bg-white w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="w-full h-[600px] bg-gray-100 rounded-[2rem] flex items-center justify-center animate-pulse border border-gray-200">
          <p className="text-gray-400 font-medium tracking-wide">Recalculating route...</p>
        </div>
      </div>
    </section>
  )
});

// ACCEPT THE PLAN TYPE PROP HERE
export default function MapWrapper({ planType }: { planType: string }) {
  return <RouteMap planType={planType} />;
}