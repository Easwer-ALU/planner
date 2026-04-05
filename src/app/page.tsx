"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Hero from "@/components/Hero"; 
import Itinerary from "@/components/Itinerary";
import MapWrapper from "@/components/MapWrapper";
import BudgetBreakdown from "@/components/BudgetBreakdown";
import Footer from "@/components/Footer";

export default function Home() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Fetch
    async function getSettings() {
      try {
        const { data, error } = await supabase
          .from("trip_settings")
          .select("*")
          .single();

        if (error) throw error;
        setSettings(data);
      } catch (err) {
        console.error("Error fetching settings:", err);
        // Robust fallback defaults
        setSettings({ show_budget: true, plan_type: "4-day", group_size: 8 });
      } finally {
        setLoading(false);
      }
    }

    getSettings();

    // 2. Realtime Listener
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trip_settings',
        },
        (payload) => {
          setSettings(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F9F8F6]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2C7A54]"></div>
      </div>
    );
  }

  // --- LOGIC SECTION (Declared only once) ---
  
  const activePlan = settings?.plan_type || "4-day";
  const groupSize = settings?.group_size || 8;
  const activeBudget = activePlan === "5-day" ? settings?.budget_5day : settings?.budget_4day;

  // Calculate the live total from the budget list
  const calculatedTotal = activeBudget
    ? activeBudget.reduce((sum: number, item: any) => sum + (parseInt(item.cost) || 0), 0)
    : 15500;

  return (
    <main className="w-full bg-[#F9F8F6]">
      {/* 1. Hero now gets Plan, Real-time Total, and Group Size */}
      <Hero 
        planType={activePlan} 
        activeBudgetTotal={calculatedTotal} 
        groupSize={groupSize} 
      />
      
      <Itinerary planType={activePlan} />
      
      <MapWrapper planType={activePlan} />
      
      {settings?.show_budget && (
        <BudgetBreakdown 
          planType={activePlan} 
          customBudget={activeBudget}
          groupSize={groupSize} 
        />
      )}

      <Footer />
    </main>
  );
}