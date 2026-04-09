import { motion } from "framer-motion";
import { Wallet, Train, Home, Car, Utensils, Receipt, Info } from "lucide-react";
import { cn } from "@/lib/utils";

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
  planType = "4-day", 
  customBudget,
  groupSize = 8 
}: { 
  planType?: string; 
  customBudget?: any[]; 
  groupSize?: number;
}) {
  const is5Day = planType === "5-day";
  
  // Use customBudget if it has items, otherwise use defaults
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

  const total = displayItems.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0), 0);

  return (
    <div className="space-y-16">
      <div className="space-y-3 text-center md:text-left">
        <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40 text-[var(--foreground)]">Financial Ledger</p>
        <h2 className="text-5xl md:text-6xl font-serif font-bold italic tracking-tighter text-[var(--foreground)]">Expedition Budget</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {displayItems.map((item: any, i: number) => {
            const Icon = getIcon(item.category || "");
            return (
              <div 
                key={item.id || i}
                className="flex items-center justify-between p-8 glass rounded-[3rem] group hover:bg-black/[0.01] dark:hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-4 md:gap-8 min-w-0 pr-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] bg-black/[0.03] dark:bg-white/5 flex items-center justify-center text-emerald-600 dark:text-backwater-blue group-hover:scale-110 transition-transform shadow-inner shrink-0">
                    <Icon size={24} />
                  </div>
                  <div className="space-y-1 min-w-0 pr-2">
                    <h4 className="font-serif font-bold text-lg md:text-2xl leading-tight text-[var(--foreground)]">{item.category || "Uncategorized"}</h4>
                    {item.detail && item.detail !== "No details provided" && (
                      <p className="text-[10px] md:text-xs opacity-40 font-bold uppercase tracking-[0.15em] text-[var(--foreground)] leading-relaxed">{item.detail}</p>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-1 shrink-0">
                  <p className="text-xl md:text-3xl font-serif font-bold text-[var(--foreground)] tracking-tight">₹{(Number(item.cost) || 0).toLocaleString()}</p>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-30 text-[var(--foreground)]">Per Person</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-8">
          <div className="p-12 glass rounded-[4rem] bg-emerald-600/[0.03] dark:bg-backwater-blue/[0.05] border border-emerald-600/10 dark:border-white/5 flex flex-col justify-between h-full min-h-[450px] shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-[var(--foreground)]">Total Estimate</p>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live</span>
                </div>
              </div>
              <div className="py-2 md:py-4">
                <h3 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-emerald-700 dark:text-backwater-blue leading-none tracking-tighter">
                  ₹{total.toLocaleString()}
                </h3>
                <div className="h-1.5 w-24 bg-emerald-600/20 mt-6 rounded-full" />
              </div>
              <p className="text-base font-medium opacity-50 leading-relaxed text-[var(--foreground)]">Carefully calculated for your group of {groupSize} monsoon explorers.</p>
            </div>
            
            <div className="pt-12">
              <div className="flex items-center gap-4 text-xs font-black opacity-30 px-2 tracking-widest uppercase text-[var(--foreground)]">
                <Info size={18} className="text-emerald-600" />
                <span>All logistics included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
