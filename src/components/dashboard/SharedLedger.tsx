import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Receipt, TrendingUp, TrendingDown, ArrowRightLeft, IndianRupee, Info, CheckCircle2, Trash2, History, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Member, Expense, Settlement } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";
import AddExpenseModal from "./AddExpenseModal";
import { db, addDoc, collection, serverTimestamp, deleteDoc, doc } from "@/lib/firebase";

interface SharedLedgerProps {
  members: Member[];
  expenses: Expense[];
}

export default function SharedLedger({ members, expenses }: SharedLedgerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'expenses' | 'settlements'>('expenses');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<{data: any, id: string} | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Logic to calculate balances
  const balances = useMemo(() => {
    const bal: Record<string, number> = {};
    members.forEach(m => bal[m.id] = 0);

    expenses.forEach(exp => {
      const payerId = exp.paidBy;
      const amount = exp.amount;
      
      // Payer gets full amount added
      if (bal[payerId] !== undefined) {
        bal[payerId] += amount;
      }

      // Each participant gets their share subtracted
      if (exp.splitType === 'equal') {
        const share = amount / exp.splitAmong.length;
        exp.splitAmong.forEach(participantId => {
          if (bal[participantId] !== undefined) {
            bal[participantId] -= share;
          }
        });
      } else if (exp.splitType === 'exact' && exp.customAmounts) {
        Object.entries(exp.customAmounts).forEach(([participantId, customShare]) => {
          if (bal[participantId] !== undefined) {
            bal[participantId] -= customShare;
          }
        });
      }
    });

    return bal;
  }, [members, expenses]);

  const totalSpent = useMemo(() => {
     return expenses.filter(e => !e.isSettlement).reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  // Settlement Algorithm (Minimal Transactions)
  const settlements = useMemo(() => {
    const setts: Settlement[] = [];
    const debtors = members
      .map(m => ({ id: m.id, balance: balances[m.id] }))
      .filter(m => m.balance < -0.01)
      .sort((a, b) => a.balance - b.balance); // Most negative first

    const creditors = members
      .map(m => ({ id: m.id, balance: balances[m.id] }))
      .filter(m => m.balance > 0.01)
      .sort((a, b) => b.balance - a.balance); // Most positive first

    let i = 0, j = 0;
    const tempDebtors = JSON.parse(JSON.stringify(debtors));
    const tempCreditors = JSON.parse(JSON.stringify(creditors));

    while (i < tempDebtors.length && j < tempCreditors.length) {
      const amount = Math.min(-tempDebtors[i].balance, tempCreditors[j].balance);
      setts.push({
        from: tempDebtors[i].id,
        to: tempCreditors[j].id,
        amount: Math.round(amount * 100) / 100
      });

      tempDebtors[i].balance += amount;
      tempCreditors[j].balance -= amount;

      if (Math.abs(tempDebtors[i].balance) < 0.01) i++;
      if (Math.abs(tempCreditors[j].balance) < 0.01) j++;
    }

    return setts;
  }, [members, balances]);

  const handleSettleUp = async (fromId: string, toId: string, amount: number) => {
    try {
      const fromName = members.find(m => m.id === fromId)?.name;
      const toName = members.find(m => m.id === toId)?.name;

      await addDoc(collection(db, "trip_settings", "main", "actual_expenses"), {
        description: `Settlement: ${fromName} paid ${toName}`,
        amount: amount,
        date: serverTimestamp(),
        paidBy: fromId,
        splitAmong: [toId],
        splitType: 'exact',
        customAmounts: { [toId]: amount },
        category: 'Settlement',
        isSettlement: true
      });
    } catch (error) {
      console.error("Settlement failed", error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const expenseToSide = expenses.find(e => e.id === expenseId);
      if (!expenseToSide) return;

      // Take snapshot before deletion
      const { id, ...data } = expenseToSide;
      setLastDeleted({ data, id });
      
      await deleteDoc(doc(db, "trip_settings", "main", "actual_expenses", expenseId));
      
      // Trigger Toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (error) {
      console.error("Deletion failed", error);
    }
  };

  const handleUndo = async () => {
    if (!lastDeleted) return;
    try {
      await addDoc(collection(db, "trip_settings", "main", "actual_expenses"), {
        ...lastDeleted.data,
        date: serverTimestamp() // Refresh timestamp to move to top
      });
      setShowToast(false);
      setLastDeleted(null);
    } catch (error) {
      console.error("Undo failed", error);
    }
  };

  const recentExpenses = useMemo(() => {
    return expenses.filter(e => !e.isSettlement);
  }, [expenses]);

  const settlementHistory = useMemo(() => {
    return expenses.filter(e => e.isSettlement).sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date();
      const dateB = b.date?.toDate ? b.date.toDate() : new Date();
      return dateB.getTime() - dateA.getTime();
    });
  }, [expenses]);

  return (
    <div className="space-y-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40 text-[var(--foreground)]">Trip Financials</p>
          <h2 className="text-5xl md:text-6xl font-serif font-bold italic tracking-tighter text-[var(--foreground)]">Shared Ledger</h2>
        </div>
        
        <div className="w-full md:w-auto flex bg-black/[0.03] dark:bg-white/[0.05] p-1.5 rounded-2xl border border-black/5 dark:border-white/10">
          <button 
            onClick={() => setActiveView('expenses')}
            className={cn(
              "flex-1 md:flex-none px-8 py-3 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all",
              activeView === 'expenses' ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xl" : "opacity-30 hover:opacity-100"
            )}
          >Log</button>
          <button 
            onClick={() => setActiveView('settlements')}
            className={cn(
              "flex-1 md:flex-none px-8 py-3 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all",
              activeView === 'settlements' ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20" : "opacity-30 hover:opacity-100"
            )}
          >Settle</button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/5 dark:scrollbar-thumb-white/5 scroll-smooth">
        <div className="glass p-8 rounded-[2.5rem] border-blue-500/10 shadow-lg group min-w-[280px] shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
              <Receipt size={20} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Group Spent</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-serif font-bold text-[var(--foreground)]">₹{totalSpent.toLocaleString()}</h3>
            <p className="text-[10px] font-medium opacity-30 uppercase tracking-widest">Total expedition costs</p>
          </div>
        </div>

        {members.map(m => {
          const bal = balances[m.id] || 0;
          const isOwed = bal > 0.01;
          const isOwer = bal < -0.01;
          
          return (
            <div key={m.id} className="glass p-8 rounded-[2.5rem] border-white/5 shadow-lg group min-w-[280px] shrink-0">
              <div className="flex items-center gap-4 mb-4">
                <MemberAvatar member={m} size="sm" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 line-clamp-1">{m.name}'s Net</p>
              </div>
              <div className="space-y-1">
                <h3 className={cn(
                  "text-3xl font-serif font-bold tracking-tight",
                  isOwed ? "text-emerald-600" : isOwer ? "text-red-500/80" : "text-[var(--foreground)] opacity-40"
                )}>
                  ₹{Math.abs(Math.round(bal)).toLocaleString()}
                </h3>
                <div className="flex items-center gap-1.5">
                  {isOwed ? <TrendingUp size={12} className="text-emerald-600" /> : isOwer ? <TrendingDown size={12} className="text-red-500" /> : <Info size={12} className="opacity-20" />}
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30">
                    {isOwed ? "Owed to them" : isOwer ? "They owe others" : "All settled up"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between px-4">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] opacity-30">
                {activeView === 'expenses' ? "Recent Activity" : "Clear Dues"}
              </h4>
              {activeView === 'expenses' && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all shadow-xl shadow-emerald-500/20"
                >
                  <Plus size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Log Expense</span>
                </button>
              )}
           </div>

           <AnimatePresence mode="wait">
             {activeView === 'expenses' ? (
                <motion.div 
                  key="expenses"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {recentExpenses.length === 0 ? (
                    <div className="glass p-20 rounded-[3rem] text-center border-dashed border-white/5">
                       <p className="text-xs font-black uppercase tracking-widest opacity-20">No expenses logged yet</p>
                    </div>
                  ) : (
                    recentExpenses.map(exp => {
                      const payer = members.find(m => m.id === exp.paidBy);
                      return (
                        <div key={exp.id} className="glass p-6 md:p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/5">
                          <div className="flex items-center gap-6">
                            <MemberAvatar member={payer} size="md" />
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-[var(--foreground)]">{exp.description}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-30">
                                {payer?.name} paid ₹{exp.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-right space-y-1">
                               <p className="text-xl font-serif font-bold text-[var(--foreground)]">
                                 ₹{exp.amount.toLocaleString()}
                               </p>
                               <p className="text-[9px] font-black uppercase tracking-widest opacity-20">
                                 {exp.date?.toDate ? exp.date.toDate().toLocaleDateString() : 'Syncing...'}
                               </p>
                            </div>
                            <button 
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-3 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-40 group-hover:opacity-100"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </motion.div>
             ) : (
                <motion.div 
                  key="settlements"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-16"
                >
                  <div className="space-y-12">
                    {settlements.length === 0 ? (
                      <div className="glass p-20 rounded-[3rem] text-center border-emerald-500/20 bg-emerald-500/5">
                         <CheckCircle2 size={48} className="text-emerald-600 mx-auto mb-6" />
                         <h3 className="text-2xl font-serif font-bold text-emerald-600 mb-2">Perfectly Balanced</h3>
                         <p className="text-xs font-black uppercase tracking-widest opacity-40">All debts have been cleared</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {members.filter(m => Math.abs(balances[m.id]) > 0.01).map(m => {
                          const bal = balances[m.id];
                          const isOwer = bal < -0.01;
                          const mSettlements = settlements.filter(s => isOwer ? s.from === m.id : s.to === m.id);
                          const isExpanded = expandedMember === m.id;

                          return (
                            <motion.div 
                              layout
                              initial={false}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                opacity: { duration: 0.2 }
                              }}
                              key={m.id}
                              className={cn(
                                "glass rounded-[2rem] border overflow-hidden",
                                isExpanded ? "md:col-span-2 ring-2" : "cursor-pointer hover:bg-white/[0.02]"
                              )}
                              style={{ 
                                borderColor: isExpanded ? `${m.color}33` : 'transparent',
                                ringColor: m.color 
                              }}
                            >
                              <div 
                                className="p-6 md:p-10 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] transition-all gap-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedMember(isExpanded ? null : m.id);
                                }}
                              >
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                  <MemberAvatar member={m} size="md" className="shrink-0" />
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-base md:text-lg truncate tracking-tight" style={{ color: m.color }}>{m.name}</h4>
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30 mt-0.5">
                                      {isOwer ? "Needs to pay" : "Is owed"}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="flex items-baseline justify-end gap-1">
                                    <span className={cn("text-xs font-serif italic", isOwer ? "text-red-400" : "text-emerald-500 opacity-60")}>₹</span>
                                    <p className={cn("text-2xl md:text-3xl font-serif font-black tracking-tighter leading-none relative z-10", isOwer ? "text-red-400" : "text-emerald-500")}>
                                      {Math.abs(Math.round(bal)).toLocaleString()}
                                    </p>
                                  </div>
                                  {isExpanded && (
                                    <div className="text-[7px] font-black uppercase tracking-[0.2em] opacity-10 mt-2">Collapse Header</div>
                                  )}
                                </div>
                              </div>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-white/5 bg-black/[0.02] dark:bg-white/[0.01]"
                                  >
                                    <div className="p-6 md:p-8 space-y-4">
                                      {mSettlements.map((sett, idx) => {
                                        const otherM = members.find(mem => mem.id === (isOwer ? sett.to : sett.from));
                                        return (
                                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/[0.03] p-4 sm:p-5 rounded-2xl border border-white/5 gap-4">
                                            <div className="flex items-center gap-3">
                                              <ArrowRightLeft size={12} className="opacity-20 shrink-0" />
                                              <div className="flex flex-wrap items-baseline gap-x-2">
                                                <span className="text-[10px] opacity-40 uppercase font-black tracking-tight">{isOwer ? "Pay" : "Collect from"}</span>
                                                <span className="text-sm font-bold truncate max-w-[120px] sm:max-w-none" style={{ color: otherM?.color }}>{otherM?.name}</span>
                                              </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                                              <div className="flex items-baseline gap-0.5">
                                                <span className="text-[10px] font-serif italic opacity-40">₹</span>
                                                <span className="text-base sm:text-lg font-serif font-bold">{sett.amount.toLocaleString()}</span>
                                              </div>
                                              <button 
                                                onClick={() => handleSettleUp(sett.from, sett.to, sett.amount)}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 transition-all active:scale-95"
                                              >Record Pay</button>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Settlement History (Persistent Section) */}
                  <div className="space-y-4 pt-12 border-t border-white/5">
                    <button 
                      onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                      className="w-full glass p-6 rounded-2xl flex items-center justify-between border-white/5 hover:bg-white/[0.02] transition-all text-left group"
                    >
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            isHistoryExpanded ? "bg-emerald-600 text-white" : "bg-emerald-500/10 text-emerald-500"
                          )}>
                            <History size={16} />
                          </div>
                          <div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest">Settlement History</h5>
                            <p className="text-[9px] opacity-30 uppercase font-black">{settlementHistory.length} Past Records</p>
                          </div>
                       </div>
                       <motion.div
                          animate={{ rotate: isHistoryExpanded ? 180 : 0 }}
                          className="opacity-20 group-hover:opacity-100 transition-opacity"
                       >
                          <ChevronDown size={20} />
                       </motion.div>
                    </button>

                    <AnimatePresence>
                      {isHistoryExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-3"
                        >
                          {settlementHistory.length === 0 ? (
                            <div className="p-12 text-center opacity-20">
                               <p className="text-[10px] uppercase font-black tracking-widest">No past settlements recorded</p>
                            </div>
                          ) : (
                            settlementHistory.map(exp => (
                              <div key={exp.id} className="glass p-5 rounded-2xl flex items-center justify-between border-emerald-500/10 group">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <CheckCircle2 size={14} />
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-bold line-clamp-1">{exp.description}</p>
                                    <p className="text-[9px] font-black uppercase opacity-30">
                                      ₹{exp.amount.toLocaleString()} • {exp.date?.toDate ? exp.date.toDate().toLocaleDateString() : 'Syncing...'}
                                    </p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-40 group-hover:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Info Column */}
        <div className="space-y-8">
           <div className="glass p-10 rounded-[3rem] bg-emerald-600/[0.03] border-emerald-500/10 space-y-8">
              <h5 className="text-[10px] font-black uppercase tracking-widest opacity-40">Financial Health</h5>
              <div className="space-y-6">
                 {members.map(m => {
                    const bal = balances[m.id] || 0;
                    const pct = totalSpent > 0 ? (bal / totalSpent) * 100 : 0;
                    return (
                      <div key={m.id} className="space-y-2">
                         <div className="flex justify-between items-center px-1">
                            <span className="text-[11px] font-bold">{m.name}</span>
                            <span className={cn(
                              "text-[10px] font-black",
                              bal > 0 ? "text-emerald-600" : bal < 0 ? "text-red-500" : "opacity-20"
                            )}>
                              {bal > 0 ? "Owed" : bal < 0 ? "Owes" : "Settled"}
                            </span>
                         </div>
                         <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, Math.abs(pct) * 2)}%` }}
                              className={cn(
                                "h-full rounded-full",
                                bal > 0 ? "bg-emerald-500 text-emerald-500 shadow-[0_0_10px_currentColor]" : "bg-red-500 text-red-500 shadow-[0_0_10px_currentColor]"
                              )}
                            />
                         </div>
                      </div>
                    )
                 })}
              </div>
           </div>

           <div className="glass p-8 rounded-[2.5rem] opacity-40 hover:opacity-100 transition-opacity">
              <div className="flex gap-4">
                 <Info size={18} className="shrink-0 text-emerald-600" />
                 <p className="text-[10px] font-medium leading-relaxed">
                   Balances are calculated in real-time. We use a debt-simplification algorithm to suggest the fewest possible transfers to get everyone settled.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Undo Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-md"
          >
            <div className="glass p-4 rounded-2xl border-white/10 shadow-2xl bg-zinc-900/90 flex items-center justify-between gap-4 backdrop-blur-xl">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <Trash2 size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Record Deleted</p>
                    <p className="text-[9px] opacity-40 uppercase font-black truncate max-w-[150px]">
                      {lastDeleted?.data?.description}
                    </p>
                  </div>
               </div>
               <button 
                onClick={handleUndo}
                className="px-6 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
               >Undo Action</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        members={members} 
      />
    </div>
  );
}
