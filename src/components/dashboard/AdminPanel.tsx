import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Calendar, Receipt, Plus, Trash2, Users, LogOut, CheckCircle2, AlertCircle, X, ChevronDown, Hammer, LayoutGrid, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { db, OperationType, handleFirestoreError, doc, setDoc, collection, addDoc, deleteDoc, updateDoc, serverTimestamp, getDocs, query, where } from "@/lib/firebase";
import { SuperAdminContent } from "./SuperAdminPanel";


interface AdminPanelProps {
  initialSettings: any;
  budgetItems: any[];
  members: any[];
  authRole?: 'none' | 'admin' | 'superadmin';
  onExit?: () => void;
}


export default function AdminPanel({ initialSettings, budgetItems, members, authRole, onExit }: AdminPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'architect'>('dashboard');
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);


  useEffect(() => {
    const fetchAvailablePlans = async () => {
      try {
        const q = query(collection(db, "itineraries"), where("isAvailableForAdmin", "==", true));
        const snapshot = await getDocs(q);
        setAvailablePlans(snapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Failed to fetch available plans", error);
      }
    };
    fetchAvailablePlans();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const showNotify = (status: 'success' | 'error') => {
    setSaveStatus(status);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const toggleBudget = async () => {
    const newVal = !initialSettings.show_budget;
    try {
      await setDoc(doc(db, "trip_settings", "main"), { ...initialSettings, show_budget: newVal }, { merge: true });
      showNotify('success');
    } catch (error) {
      showNotify('error');
      handleFirestoreError(error, OperationType.WRITE, "trip_settings/main");
    }
  };

  const changePlan = async (newPlan: string) => {
    try {
      await setDoc(doc(db, "trip_settings", "main"), { ...initialSettings, plan_type: newPlan }, { merge: true });
      showNotify('success');
    } catch (error) {
      showNotify('error');
      handleFirestoreError(error, OperationType.WRITE, "trip_settings/main");
    }
  };

  const updateGroupSize = async (val: number) => {
    try {
      await setDoc(doc(db, "trip_settings", "main"), { ...initialSettings, group_size: val }, { merge: true });
      showNotify('success');
    } catch (error) {
      showNotify('error');
      handleFirestoreError(error, OperationType.WRITE, "trip_settings/main");
    }
  };

  // --- Real-time Subcollection Actions ---

  const addBudgetItem = async () => {
    const is5Day = initialSettings.plan_type === "5-day";
    try {
      const budgetCollection = collection(db, "trip_settings", "main", "budget_items");
      await addDoc(budgetCollection, {
        category: "",
        cost: 0,
        detail: "",
        plan_type: initialSettings.plan_type,
        createdAt: serverTimestamp()
      });
      showNotify('success');
    } catch (error) {
      showNotify('error');
      handleFirestoreError(error, OperationType.CREATE, "trip_settings/main/budget_items");
    }
  };

  const removeBudgetItem = async (id: string) => {
    try {
      const itemDoc = doc(db, "trip_settings", "main", "budget_items", id);
      await deleteDoc(itemDoc);
      showNotify('success');
    } catch (error) {
      showNotify('error');
      handleFirestoreError(error, OperationType.DELETE, `trip_settings/main/budget_items/${id}`);
    }
  };

  const updateBudgetItemField = async (id: string, field: string, value: any) => {
    try {
      const itemDoc = doc(db, "trip_settings", "main", "budget_items", id);
      await updateDoc(itemDoc, {
        [field]: field === "cost" ? (parseInt(value) || 0) : value
      });
      // No explicit success notify for typing to avoid toast spam
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `trip_settings/main/budget_items/${id}`);
    }
  };

  const addMember = async () => {
    console.log("Attempting to add member. Current db ID:", db.app.options.projectId);
    try {
      const membersCollection = collection(db, "trip_settings", "main", "members");
      console.log("Collection path:", membersCollection.path);
      
      const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      await addDoc(membersCollection, {
        name: "New Member",
        color: randomColor,
        createdAt: serverTimestamp()
      });
      console.log("Member added successfully");
      showNotify('success');
    } catch (error) {
      console.error("Add Member Failed. Detailed Error:", error);
      showNotify('error');
      handleFirestoreError(error, OperationType.CREATE, "trip_settings/main/members");
    }
  };

  const removeMember = async (id: string) => {
    try {
      const memberDoc = doc(db, "trip_settings", "main", "members", id);
      await deleteDoc(memberDoc);
      showNotify('success');
    } catch (error) {
      showNotify('error');
      handleFirestoreError(error, OperationType.DELETE, `trip_settings/main/members/${id}`);
    }
  };

  const updateMemberField = async (id: string, field: string, value: string) => {
    try {
      const memberDoc = doc(db, "trip_settings", "main", "members", id);
      await updateDoc(memberDoc, { [field]: value });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `trip_settings/main/members/${id}`);
      return false;
    }
  };

  // ----------------------------------------

  if (!initialSettings) return null;

  const currentPlanBudget = budgetItems.filter(item => item.plan_type === initialSettings.plan_type);
  const totalBudget = currentPlanBudget.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

  return (
    <div className="min-h-screen pt-12 md:pt-28 pb-32 px-4 md:px-12 max-w-5xl mx-auto space-y-12 md:space-y-16">
      
      {/* Nice Toast Notification */}
      <AnimatePresence>
        {saveStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-8 py-4 glass rounded-[2rem] shadow-2xl"
          >
            {saveStatus === 'success' ? (
              <CheckCircle2 className="text-green-400" size={24} />
            ) : (
              <AlertCircle className="text-red-400" size={24} />
            )}
            <span className="text-xs font-black uppercase tracking-widest">
              {saveStatus === 'success' ? "Changes Synchronized" : "Sync Failed"}
            </span>
            <button onClick={() => setSaveStatus('idle')} className="ml-4 opacity-40 hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40 text-[var(--foreground)]">The Mission Control</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-8">
            <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-[var(--foreground)]">
              {adminViewMode === 'dashboard' ? "Trail Settings" : "Master Architect"}
            </h1>
            
            {authRole === 'superadmin' && (
              <div className="flex w-fit bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/10 dark:border-white/10 shadow-inner">
                <button 
                  onClick={() => setAdminViewMode('dashboard')}
                  className={cn(
                    "px-5 py-2.5 rounded-[10px] text-[9px] font-black uppercase tracking-widest transition-all",
                    adminViewMode === 'dashboard' ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xl" : "opacity-30 hover:opacity-100"
                  )}
                >Dashboard</button>
                <button 
                  onClick={() => setAdminViewMode('architect')}
                  className={cn(
                    "px-5 py-2.5 rounded-[10px] text-[9px] font-black uppercase tracking-widest transition-all",
                    adminViewMode === 'architect' ? "bg-purple-600 text-white shadow-xl shadow-purple-600/20" : "opacity-30 hover:opacity-100"
                  )}
                >Architect</button>
              </div>
            )}
          </div>

        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex px-6 py-3.5 glass rounded-2xl text-emerald-600 dark:text-emerald-400 items-center gap-3 border-emerald-600/10 shadow-lg shadow-emerald-600/5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Live Sync Active</span>
          </div>
          <button 
            onClick={onExit} 
            className="px-6 py-3.5 glass rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all shadow-xl text-[var(--foreground)]"
          >
            Exit Control
          </button>
          <button onClick={handleLogout} className="p-4 md:p-5 glass rounded-2xl text-red-500 hover:bg-red-500/10 transition-all shadow-xl">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {adminViewMode === 'dashboard' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Budget Visibility */}
            <div className="glass p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("p-4 rounded-2xl", initialSettings.show_budget ? "bg-coconut-palm/10 text-coconut-palm" : "bg-red-500/10 text-red-500")}>
                  {initialSettings.show_budget ? <Eye size={24} /> : <EyeOff size={24} />}
                </div>
                <div>
                  <p className="font-serif font-bold text-lg text-[var(--foreground)]">Budget Visibility</p>
                  <p className="text-xs opacity-40 font-black uppercase tracking-widest text-[var(--foreground)]">{initialSettings.show_budget ? "Visible" : "Hidden"}</p>
                </div>
              </div>
              <button onClick={toggleBudget} className="w-full py-4 glass rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[var(--foreground)] border border-black/[0.03] dark:border-white/10 shadow-sm">
                Toggle Display
              </button>
            </div>

            {/* Plan Toggle */}
            <div className="glass p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-backwater-amber/10 text-backwater-amber rounded-2xl">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="font-serif font-bold text-lg text-[var(--foreground)]">Route Version</p>
                  <p className="text-xs opacity-40 font-black uppercase tracking-widest text-[var(--foreground)]">{initialSettings.plan_type}</p>
                </div>
              </div>
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full py-4 px-6 glass rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[var(--foreground)] border border-black/[0.03] dark:border-white/10 shadow-sm"
                >
                  <span>{availablePlans.find(p => p.id === initialSettings.plan_type)?.name || initialSettings.plan_type}</span>
                  <ChevronDown className={cn("transition-transform duration-300", isDropdownOpen && "rotate-180")} size={14} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-0 right-0 mb-4 bg-zinc-950 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[110]"
                    >
                      <div className="max-h-60 overflow-y-auto scrollbar-hide py-3">
                        {availablePlans.length > 0 ? (
                          availablePlans.map(plan => (
                            <button
                              key={plan.id}
                              onClick={() => {
                                changePlan(plan.id);
                                setIsDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5",
                                initialSettings.plan_type === plan.id ? "text-emerald-400 bg-white/10" : "text-white opacity-60 hover:opacity-100"
                              )}
                            >
                              {plan.name}
                            </button>
                          ))
                        ) : (
                          ["4-day", "5-day"].map(id => (
                            <button
                              key={id}
                              onClick={() => {
                                changePlan(id);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-white opacity-60 hover:opacity-100 transition-all hover:bg-white/5"
                            >
                              {id.toUpperCase()} PLAN
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Group Size */}
            <div className="glass p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <Users size={24} />
                </div>
                <div>
                  <p className="font-serif font-bold text-lg text-[var(--foreground)]">Group Size</p>
                  <p className="text-xs opacity-40 font-black uppercase tracking-widest text-[var(--foreground)]">{initialSettings.group_size} Friends</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateGroupSize(Math.max(1, initialSettings.group_size - 1))} className="flex-1 py-4 glass rounded-xl font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[var(--foreground)] border border-black/[0.03] dark:border-white/10 shadow-sm">-</button>
                <button onClick={() => updateGroupSize(initialSettings.group_size + 1)} className="flex-1 py-4 glass rounded-xl font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[var(--foreground)] border border-black/[0.03] dark:border-white/10 shadow-sm">+</button>
              </div>
            </div>
          </div>

          {/* Group Member Management */}
          <div className="space-y-12">
            {/* Members List Header (now a toggle on mobile) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
              <button 
                onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                className="flex items-center gap-6 text-left group"
              >
                <div className={cn(
                  "p-4 glass rounded-2xl shadow-xl transition-all",
                  isMembersExpanded ? "bg-blue-600 text-white" : "text-blue-600 dark:text-blue-400"
                )}>
                  <Users size={32} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-[var(--foreground)]">Trip Participants</h2>
                    <motion.div
                      animate={{ rotate: isMembersExpanded ? 180 : 0 }}
                      className="md:hidden opacity-30"
                    >
                      <ChevronDown size={24} />
                    </motion.div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                    {members.length} {members.length === 1 ? 'Explorer' : 'Explorers'} • {isMembersExpanded ? 'Tap to hide' : 'Tap to manage'}
                  </p>
                </div>
              </button>
              <button 
                onClick={addMember} 
                className="flex items-center gap-2 px-8 py-3.5 glass rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all border border-black/[0.03] dark:border-white/10 shadow-xl text-[var(--foreground)]"
              >
                <UserPlus size={16} className="text-blue-600 dark:text-blue-400" /> Add Member
              </button>
            </div>

            <AnimatePresence>
              {(isMembersExpanded || window.innerWidth > 768) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                    <AnimatePresence mode="popLayout">
                      {members.map((member) => (
                        <MemberCard 
                          key={member.id} 
                          member={member} 
                          onUpdate={updateMemberField} 
                          onRemove={removeMember}
                          onNotify={showNotify}
                        />
                      ))}
                    </AnimatePresence>
                    {members.length === 0 && (
                      <div className="col-span-full py-12 text-center opacity-20 border-2 border-dashed border-white/10 rounded-[2rem]">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Assign explorers to track their shares</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
              <div className="flex items-center gap-6">
                <div className="p-4 glass rounded-2xl shadow-xl text-backwater-amber">
                  <Receipt size={32} />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-[var(--foreground)]">Budget Itinerary</h2>
                    <div className="w-fit px-4 py-1.5 bg-black/[0.02] dark:bg-white/5 border border-black/[0.05] dark:border-white/10 rounded-full">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30 mr-2 text-[var(--foreground)]">Total</span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-backwater-amber">₹{totalBudget.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700 dark:text-backwater-amber">
                    Editing: {initialSettings.plan_type} version
                  </p>
                </div>
              </div>
              <button 
                onClick={addBudgetItem} 
                className="flex items-center gap-2 px-8 py-3.5 glass rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all border border-black/[0.03] dark:border-white/10 shadow-xl text-[var(--foreground)]"
              >
                <Plus size={16} className="text-emerald-600 dark:text-backwater-blue" /> Add Row
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {currentPlanBudget.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative glass p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-black/[0.05] dark:border-white/10 space-y-6 md:space-y-8 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors shadow-sm overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 ml-4 text-[var(--foreground)]">Category</label>
                        <input 
                          type="text"
                          defaultValue={item.category}
                          placeholder="e.g., Transport"
                          onBlur={(e) => updateBudgetItemField(item.id, 'category', e.target.value)}
                          className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/10 px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-[1.8rem] text-[var(--foreground)] font-bold outline-none focus:ring-2 ring-emerald-600/20 dark:ring-backwater-amber/20 transition-all shadow-inner text-sm md:text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 ml-4 text-[var(--foreground)]">Cost (₹)</label>
                        <input 
                          type="number"
                          defaultValue={item.cost}
                          placeholder="2500"
                          onBlur={(e) => updateBudgetItemField(item.id, 'cost', e.target.value)}
                          className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/10 px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-[1.8rem] text-[var(--foreground)] font-bold outline-none focus:ring-2 ring-emerald-600/20 dark:ring-backwater-amber/20 transition-all shadow-inner text-sm md:text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 ml-4 text-[var(--foreground)]">Notes & Details</label>
                      <input 
                        type="text"
                        defaultValue={item.detail}
                        placeholder="Train from Kochi..."
                        onBlur={(e) => updateBudgetItemField(item.id, 'detail', e.target.value)}
                        className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/10 px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-[1.8rem] text-[var(--foreground)] font-medium opacity-80 outline-none focus:ring-2 ring-emerald-600/20 dark:ring-backwater-amber/20 transition-all shadow-inner text-sm md:text-base"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-20">Last edited: {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString() : 'Syncing...'}</p>
                      <button 
                        onClick={() => removeBudgetItem(item.id)}
                        className="p-3 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {currentPlanBudget.length === 0 && (
                <div className="text-center py-20 opacity-20 border-2 border-dashed border-white/10 rounded-[3rem]">
                  <p className="text-sm font-black uppercase tracking-widest">No budget items added yet</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <SuperAdminContent />
      )}

    </div>
  );
}

interface MemberCardProps {
  member: any;
  onUpdate: (id: string, field: string, value: string) => Promise<boolean>;
  onRemove: (id: string) => Promise<void>;
  onNotify: (status: 'success' | 'error') => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onUpdate, onRemove, onNotify }) => {
  const [name, setName] = useState(member.name);
  const [initials, setInitials] = useState(member.initials || "");

  useEffect(() => {
    setName(member.name);
    setInitials(member.initials || "");
  }, [member.id, member.name, member.initials]);

  const handleSaveName = async () => {
    if (name === member.name) return;
    const success = await onUpdate(member.id, 'name', name);
    if (success) onNotify('success');
  };

  const handleSaveInitials = async () => {
    const finalInitials = initials.toUpperCase();
    if (finalInitials === (member.initials || "")) return;
    const success = await onUpdate(member.id, 'initials', finalInitials);
    if (success) onNotify('success');
  };

  const computedInitials = member.name?.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().substring(0, 3);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative glass p-6 rounded-[2rem] border border-black/[0.05] dark:border-white/10 flex items-center gap-4 group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all"
    >
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg relative overflow-hidden"
        style={{ backgroundColor: member.color || "#ccc" }}
      >
        <input 
          type="text"
          value={initials || computedInitials}
          onChange={(e) => setInitials(e.target.value)}
          onBlur={handleSaveInitials}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-center font-black uppercase text-xs"
          maxLength={3}
        />
      </div>
      <input 
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSaveName}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className="flex-1 bg-transparent border-none outline-none font-bold text-[var(--foreground)] text-sm"
      />
      <button 
        onClick={() => onRemove(member.id)}
        className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-lg shadow-sm"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}
