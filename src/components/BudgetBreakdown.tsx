"use client";

import { motion } from "framer-motion";
import { Wallet, Train, Home, Car, Utensils, Receipt, Globe, Info } from "lucide-react";

// Helper to map text categories to Lucide icons
const getIcon = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes("train") || lower.includes("transport")) return Train;
  if (lower.includes("stay") || lower.includes("home") || lower.includes("houseboat")) return Home;
  if (lower.includes("tempo") || lower.includes("car") || lower.includes("van")) return Car;
  if (lower.includes("food") || lower.includes("meal") || lower.includes("utensils")) return Utensils;
  if (lower.includes("entry") || lower.includes("ticket") || lower.includes("fees")) return Receipt;
  return Wallet; 
};

export default function BudgetBreakdown({ 
  planType, 
  customBudget 
}: { 
  planType: string; 
  customBudget?: any[] 
}) {
  const is5Day = planType === "5-day";

  const displayItems = (customBudget && customBudget.length > 0) 
    ? customBudget 
    : is5Day 
      ? [
          { category: "Train (Return)", cost: 2500, detail: "Chennai to Alleppey / Kochi to Chennai" },
          { category: "Homestays (4 Nights)", cost: 4000, detail: "Alleppey, Thekkady, Munnar, Kochi" },
          { category: "Tempo Traveller", cost: 4500, detail: "Private 12-seater for 5 full days" },
          { category: "Food & Water", cost: 3000, detail: "Budgeted at ₹600/day" },
          { category: "Entry Fees & Shows", cost: 1000, detail: "Jatayu, Falls, Museums" },
        ] 
      : [
          { category: "Transport (Train)", cost: 2500, detail: "Round trip from Chennai" },
          { category: "Houseboat Stay", cost: 4500, detail: "4-Bedroom (All meals included)" },
          { category: "Homestays (2 Nights)", cost: 2500, detail: "Thekkady & Munnar (shared)" },
          { category: "Tempo Traveller", cost: 3000, detail: "Private 12-seater for 4 days" },
          { category: "Food & Activities", cost: 3000, detail: "Outside meals & entry fees" },
        ];

  const total = displayItems.reduce((sum, item) => sum + item.cost, 0);

  return (
    <section className="py-32 bg-white text-[#1A3326] w-full font-sans">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#E6A83C]">Financial Breakdown</span>
          <h2 className="font-serif text-5xl md:text-6xl font-bold mt-2 mb-6 tracking-tight">The Ledger</h2>
          <div className="flex items-center justify-center gap-3">
            <p className="text-[#1A3326]/50 font-medium">
              {is5Day ? "Estimated costs for the 5-Day Icons Trail" : "Finalized budget for the 4-Day Monsoon Trail"}
            </p>
            {customBudget && (
              <span className="bg-[#2C7A54]/10 text-[#2C7A54] text-[9px] uppercase font-black px-2.5 py-1 rounded-full border border-[#2C7A54]/20 tracking-tighter">
                Live Sync
              </span>
            )}
          </div>
        </div>

        {/* Main Budget Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#F9F8F6] rounded-[3.5rem] border border-[#1A3326]/5 overflow-hidden shadow-[0_40px_100px_-30px_rgba(26,51,38,0.08)]"
        >
          <div className="p-10 md:p-16">
            <div className="space-y-10">
              {displayItems.map((item, i) => {
                const IconComponent = getIcon(item.category);
                return (
                  <div key={i} className="flex items-start justify-between group">
                    <div className="flex items-center gap-6">
                      {/* Icon with Gold Accents */}
                      <div className="p-4 bg-white rounded-[1.5rem] text-[#E6A83C] shadow-sm border border-[#1A3326]/5 group-hover:scale-110 transition-all duration-500">
                        <IconComponent size={22} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-bold text-xl tracking-tight text-[#1A3326]">{item.category}</p>
                        <p className="text-sm text-[#1A3326]/40 font-medium mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                    {/* Price in Mono for that "Ticket" feel */}
                    <div className="text-right">
                      <p className="font-mono text-xl font-black text-[#1A3326]">
                        ₹{item.cost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Footer Section */}
            <div className="mt-16 pt-12 border-t border-[#1A3326]/5 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="p-3 bg-[#E6A83C]/10 rounded-2xl">
                  <Info size={20} className="text-[#E6A83C]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A3326]/30">Total per person</p>
                  <p className="text-xs text-[#1A3326]/40 italic mt-0.5">Calculated for a crew of 8 members</p>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <motion.p 
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  className="text-6xl md:text-7xl font-serif font-bold text-[#2C7A54] leading-none"
                >
                  ₹{total.toLocaleString()}
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <div className="mt-12 text-center px-10">
          <p className="text-xs text-[#1A3326]/30 leading-relaxed max-w-xl mx-auto">
           
          </p>
        </div>
      </div>
    </section>
  );
}