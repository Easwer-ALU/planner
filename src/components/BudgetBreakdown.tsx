"use client";

import { motion } from "framer-motion";
import { Wallet, Train, Home, Car, Utensils, Receipt, Info } from "lucide-react";

const getIcon = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes("train") || lower.includes("transport")) return Train;
  if (lower.includes("stay") || lower.includes("home") || lower.includes("houseboat")) return Home;
  if (lower.includes("tempo") || lower.includes("car") || lower.includes("van")) return Car;
  if (lower.includes("food") || lower.includes("meal") || lower.includes("utensils")) return Utensils;
  if (lower.includes("entry") || lower.includes("ticket") || lower.includes("fees")) return Receipt;
  return Wallet; 
};

interface BudgetProps {
  planType: string;
  customBudget?: any[];
  groupSize?: number;
}

export default function BudgetBreakdown({ 
  planType, 
  customBudget,
  groupSize = 8 
}: BudgetProps) {
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
    <section className="py-20 md:py-32 bg-[#0A0F0D] text-[#E8F3ED] w-full font-sans transition-colors duration-700">
    <div className="max-w-4xl mx-auto px-4 md:px-6">
      
      <div className="text-center mb-12 md:mb-20">
        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-[#E6A83C]">Financial Breakdown</span>
        <h2 className="font-serif text-4xl md:text-6xl font-bold mt-2 mb-4 tracking-tight text-white">The Ledger</h2>
        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-white/40 font-medium text-sm md:text-base">
            {is5Day ? "Estimated costs for the 5-Day Icons Trail" : "Finalized budget for the 4-Day Monsoon Trail"}
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-[#141C18] rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
      >
        <div className="p-6 md:p-16">
          <div className="space-y-8 md:space-y-10">
            {displayItems.map((item, i) => {
              const IconComponent = getIcon(item.category);
              return (
                <div key={i} className="flex items-start justify-between group gap-4">
                  <div className="flex items-center gap-3 md:gap-6">
                    <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-[1.5rem] text-[#E6A83C] border border-white/10 group-hover:bg-[#E6A83C] group-hover:text-white transition-all duration-500">
                      <IconComponent size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-base md:text-xl tracking-tight text-white leading-tight">{item.category}</p>
                      <p className="text-[10px] md:text-sm text-white/30 font-medium mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-base md:text-xl font-black text-[#E6A83C]">
                      ₹{item.cost.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 md:mt-16 pt-10 md:pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
             <div className="text-center md:text-right w-full">
              <p className="text-5xl md:text-7xl font-serif font-bold text-[#2C7A54] leading-none drop-shadow-[0_0_30px_rgba(44,122,84,0.3)]">
                ₹{total.toLocaleString()}
              </p>
              <p className="text-[10px] text-white/20 uppercase tracking-widest font-black mt-4">Total Per Person • Crew of {groupSize}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
  );
}