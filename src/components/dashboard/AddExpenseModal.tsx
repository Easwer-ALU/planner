import { useState } from "react";
import { X, Receipt, Check, ChevronDown, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Member, SplitType } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";
import { db, addDoc, collection, serverTimestamp } from "@/lib/firebase";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
}

export default function AddExpenseModal({ isOpen, onClose, members }: AddExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<string>(members[0]?.id || "");
  const [splitAmong, setSplitAmong] = useState<string[]>(members.map(m => m.id));
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [category, setCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["Food", "Transport", "Stay", "Activities", "Shopping", "Misc"];

  const handleSave = async () => {
    if (!description || !amount || parseFloat(amount) <= 0 || !paidBy || splitAmong.length === 0) return;

    setIsSubmitting(true);
    try {
      const expenseData = {
        description,
        amount: parseFloat(amount),
        date: serverTimestamp(),
        paidBy,
        splitAmong,
        splitType,
        category,
        isSettlement: false,
        ...(splitType === 'exact' ? { customAmounts: Object.fromEntries(Object.entries(customAmounts).map(([k, v]) => [k, parseFloat(v) || 0])) } : {})
      };

      await addDoc(collection(db, "trip_settings", "main", "actual_expenses"), expenseData);
      onClose();
      // Reset form
      setDescription("");
      setAmount("");
      setPaidBy(members[0]?.id || "");
      setSplitAmong(members.map(m => m.id));
      setSplitType("equal");
      setCustomAmounts({});
    } catch (error) {
      console.error("Failed to add expense", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleParticipant = (id: string) => {
    setSplitAmong(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-backwater-bg/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl glass rounded-[3rem] shadow-2xl border border-white/10 p-8 md:p-12 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <Receipt size={24} />
            </div>
            <h2 className="text-3xl font-serif font-bold tracking-tight text-[var(--foreground)]">New Expense</h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
          {/* Amount & Description */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600/50 group-focus-within:text-emerald-500 transition-colors">
                 <IndianRupee size={32} />
              </div>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-[2rem] py-8 pl-16 pr-8 text-4xl md:text-5xl font-serif font-bold text-emerald-600 dark:text-backwater-blue outline-none focus:ring-4 ring-emerald-500/10 transition-all placeholder:opacity-20"
              />
            </div>
            
            <input 
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was it for?"
              className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-lg font-medium text-[var(--foreground)] outline-none focus:ring-4 ring-emerald-500/10 transition-all placeholder:opacity-40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Payer Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Paid By</label>
              <div className="relative">
                <select 
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl py-4 px-6 appearance-none font-bold text-sm text-[var(--foreground)] pr-12 outline-none focus:ring-4 ring-emerald-500/10 transition-all cursor-pointer"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id} className="bg-zinc-900">{m.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Category</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl py-4 px-6 appearance-none font-bold text-sm text-[var(--foreground)] pr-12 outline-none focus:ring-4 ring-emerald-500/10 transition-all cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Splitting Logic */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Split Among</label>
              <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                 <button 
                  onClick={() => setSplitType('equal')}
                  className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", splitType === 'equal' ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-lg" : "opacity-30")}
                 >Equal</button>
                 <button 
                  onClick={() => setSplitType('exact')}
                  className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", splitType === 'exact' ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-lg" : "opacity-30")}
                 >Exact</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {members.map(m => (
                <div 
                  key={m.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                    splitAmong.includes(m.id) 
                      ? "bg-emerald-500/5 border-emerald-500/20" 
                      : "bg-black/5 dark:bg-white/5 border-transparent opacity-40 grayscale"
                  )}
                  onClick={() => toggleParticipant(m.id)}
                >
                  <MemberAvatar member={m} size="sm" />
                  <span className="flex-1 font-bold text-sm">{m.name}</span>
                  
                  {splitType === 'exact' && splitAmong.includes(m.id) && (
                    <div className="relative" onClick={e => e.stopPropagation()}>
                       <input 
                        type="number"
                        placeholder="0"
                        value={customAmounts[m.id] || ""}
                        onChange={(e) => setCustomAmounts({...customAmounts, [m.id]: e.target.value})}
                        className="w-24 bg-black/10 dark:bg-white/10 border-none rounded-lg px-3 py-2 text-right font-black text-xs outline-none ring-emerald-500/20 focus:ring-2"
                       />
                    </div>
                  )}

                  {splitAmong.includes(m.id) && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <button 
            disabled={isSubmitting || !amount || !description}
            onClick={handleSave}
            className="w-full py-6 rounded-[2rem] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-emerald-600/20 transition-all disabled:opacity-20 disabled:grayscale"
          >
            {isSubmitting ? "Syncing..." : "Add Expense"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
