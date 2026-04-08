import { useState, useEffect } from "react";
import { LogOut, Layers, Plus, Trash2, CheckCircle2, AlertCircle, Edit2, Calendar, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { db, collection, getDocs, setDoc, doc, deleteDoc, updateDoc, OperationType, handleFirestoreError } from "@/lib/firebase";

import PlanEditor from "./PlanEditor";

export default function SuperAdminPanel() {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [masterLibrary, setMasterLibrary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [view, setView] = useState<'plans' | 'library'>('plans');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingLibraryPlace, setEditingLibraryPlace] = useState<any>(null);

  const showNotify = (status: 'success' | 'error') => {
    setSaveStatus(status);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("auth_role");
    window.location.reload(); // Simple way to reset state in App.tsx
  };

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        let querySnapshot = await getDocs(collection(db, "itineraries"));
        let items: any[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Improved Seeding & Migration Logic:
        const { itineraries: mockData } = await import('@/lib/itineraryData');
        const defaultIds = ["4-day", "5-day"];
        
        for (const planId of defaultIds) {
          const existing = items.find(item => item.id === planId) as any;
          const mockPlanDays = mockData[planId];
          const mockPlanPlaces = mockData.places?.[planId] || [];

          // Migration check: If no places exist or if Day 1 Event still has coords (the old structure)
          const dbDay1Evt1 = existing?.days?.[0]?.events?.[0];
          
          if (!existing || (!existing.places?.length && mockPlanPlaces.length) || dbDay1Evt1?.coords) {
            console.log(`Auto-migrating ${planId} to new Places structure...`);
            await setDoc(doc(db, "itineraries", planId), {
              id: planId,
              name: existing?.name || `${planId} Plan`,
              isAvailableForAdmin: true,
              days: mockPlanDays,
              places: mockPlanPlaces
            }, { merge: true });
          }
        }

        // Re-fetch after seeding/migration
        querySnapshot = await getDocs(collection(db, "itineraries"));
        items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setItineraries(items);

        // Fetch Master Library
        const librarySnapshot = await getDocs(collection(db, "places"));
        const libraryItems = librarySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMasterLibrary(libraryItems);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchItineraries();
  }, []);

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "itineraries", id), {
        isAvailableForAdmin: !currentStatus
      });
      setItineraries(prev => prev.map(p => p.id === id ? { ...p, isAvailableForAdmin: !currentStatus } : p));
      showNotify('success');
    } catch (error) {
      showNotify('error');
      handleFirestoreError(error, OperationType.UPDATE, `itineraries/${id}`);
    }
  };

  const duplicatePlan = async (plan: any) => {
    const newId = "draft-" + Math.floor(Math.random() * 1000000);
    try {
      const newPlan = {
        ...plan,
        id: newId,
        name: `${plan.name} (Copy)`,
        isAvailableForAdmin: false
      };
      await setDoc(doc(db, "itineraries", newId), newPlan);
      setItineraries(prev => [...prev, newPlan]);
      showNotify('success');
    } catch (error) {
      showNotify('error');
      handleFirestoreError(error, OperationType.CREATE, `itineraries/${newId}`);
    }
  };

  const createNewPlan = async () => {
    const planId = "draft-" + Math.floor(Math.random() * 1000000);
    try {
      const newPlan = {
        id: planId,
        name: "New Draft Plan",
        isAvailableForAdmin: false,
        days: [
          {
            id: `day1-${planId}`,
            tabLabel: "Day 1",
            title: "Draft Day 1",
            events: [],
            photos: ["https://images.unsplash.com/photo-1593693397690-362cb9666fc2"]
          }
        ]
      };
      await setDoc(doc(db, "itineraries", planId), newPlan);
      setItineraries(prev => [...prev, newPlan]);
      showNotify('success');
    } catch (error) {
      showNotify('error');
      handleFirestoreError(error, OperationType.CREATE, `itineraries/${planId}`);
    }
  };
  const savePlan = async (updatedPlan: any) => {
    try {
      await updateDoc(doc(db, "itineraries", updatedPlan.id), {
        name: updatedPlan.name,
        days: updatedPlan.days,
        places: updatedPlan.places || []
      });
      setItineraries(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      setEditingPlan(null);
      showNotify('success');
    } catch (error) {
      showNotify('error');
      handleFirestoreError(error, OperationType.UPDATE, `itineraries/${updatedPlan.id}`);
    }
  };

  const saveMasterPlace = async (place: any) => {
    try {
        await setDoc(doc(db, "places", place.id), place);
        setMasterLibrary(prev => {
            const exists = prev.find(p => p.id === place.id);
            if (exists) return prev.map(p => p.id === place.id ? place : p);
            return [...prev, place];
        });
        showNotify('success');
    } catch (error) {
        showNotify('error');
        console.error("Save Master Place Error:", error);
        handleFirestoreError(error, OperationType.UPDATE, `places/${place.id}`);
    }
  };

  const deleteMasterPlace = async (id: string) => {
    try {
        await deleteDoc(doc(db, "places", id));
        setMasterLibrary(prev => prev.filter(p => p.id !== id));
        showNotify('success');
    } catch (error) {
        showNotify('error');
        handleFirestoreError(error, OperationType.DELETE, `places/${id}`);
    }
  };
  return (
    <div className="min-h-screen bg-[#0B0914] text-white transition-colors duration-700 py-20 px-6 font-sans selection:bg-purple-600/20">
      <AnimatePresence>
        {saveStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-3xl"
          >
            {saveStatus === 'success' ? (
              <CheckCircle2 className="text-green-400" size={24} />
            ) : (
              <AlertCircle className="text-red-400" size={24} />
            )}
            <span className="text-xs font-black uppercase tracking-widest text-white">
              {saveStatus === 'success' ? "Changes Synced" : "Sync Failed"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-16">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <p className="text-[#8B5CF6] text-xs font-black uppercase tracking-[0.4em]">Super Admin Protocol</p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-white">Itinerary Builder</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="px-6 py-3.5 bg-purple-500/10 rounded-2xl text-purple-400 flex items-center gap-3 border border-purple-500/20">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Master Control Active</span>
            </div>
            <button onClick={handleLogout} className="p-5 bg-red-500/10 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="py-32 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : editingPlan ? (
          <PlanEditor 
            plan={editingPlan} 
            masterLibrary={masterLibrary}
            onSave={savePlan} 
            onCancel={() => setEditingPlan(null)} 
          />
        ) : editingLibraryPlace ? (
          <div className="space-y-12">
            <div className="flex items-center justify-between bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
              <h2 className="text-3xl font-serif font-bold">Edit Library Place</h2>
              <button 
                onClick={() => setEditingLibraryPlace(null)}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-full text-xs font-black uppercase tracking-widest transition-all"
              >Cancel</button>
            </div>
            <div className="glass p-10 rounded-[3rem] border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 group">
                    <img src={editingLibraryPlace.image} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest relative">
                         Change Photo
                         <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                    const { storage, ref, uploadBytes, getDownloadURL } = await import('@/lib/firebase');
                                    const storageRef = ref(storage, `places/${Date.now()}_${file.name}`);
                                    const snap = await uploadBytes(storageRef, file);
                                    const url = await getDownloadURL(snap.ref);
                                    setEditingLibraryPlace((prev: any) => ({ ...prev, image: url }));
                                } catch (err) {
                                    console.error("Upload failed", err);
                                    alert("Upload failed. Check storage rules.");
                                }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                          />
                       </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest opacity-40">Place Name</label>
                    <input 
                      value={editingLibraryPlace.name} 
                      onChange={(e) => setEditingLibraryPlace((prev: any) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xl font-bold focus:border-purple-500/50 outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest opacity-40">Category</label>
                    <select 
                      value={editingLibraryPlace.category} 
                      onChange={(e) => setEditingLibraryPlace((prev: any) => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-purple-500/50 outline-none appearance-none"
                    >
                      <option value="Landmark">Landmark</option>
                      <option value="Nature">Nature</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Food">Food</option>
                      <option value="Shopping">Shopping</option>
                    </select>
                  </div>
               </div>
               <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest opacity-40">Description</label>
                    <textarea 
                      rows={4}
                      value={editingLibraryPlace.desc} 
                      onChange={(e) => setEditingLibraryPlace((prev: any) => ({ ...prev, desc: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm opacity-80 focus:border-purple-500/50 outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest opacity-40">Coordinates (Lat, Lon)</label>
                    <input 
                      placeholder="e.g. 9.9312, 76.2673"
                      value={`${editingLibraryPlace.coords[1]}, ${editingLibraryPlace.coords[0]}`} 
                      onChange={(e) => {
                         const parts = e.target.value.split(/[,\s]+/).filter(Boolean).map(p => parseFloat(p.trim()));
                         if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                            setEditingLibraryPlace((prev: any) => ({ ...prev, coords: [parts[1], parts[0]] }));
                         }
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono focus:border-purple-500/50 outline-none"
                    />
                  </div>
                  <div className="pt-8">
                    <button 
                      onClick={async () => {
                        await saveMasterPlace(editingLibraryPlace);
                        setEditingLibraryPlace(null);
                      }}
                      className="w-full py-6 bg-purple-600 hover:bg-purple-500 rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl active:scale-[0.98] transition-all"
                    >Save Changes</button>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-3xl font-serif font-bold tracking-tight">Active Plans</h2>
              <div className="flex gap-4">
                <button 
                  disabled={isSyncing}
                  onClick={async () => {
                    if (!confirm("This will overwrite existing itineraries and places with default templates. Continue?")) return;
                    setIsSyncing(true);
                    try {
                        const { itineraries: mockData, masterPlaces } = await import('@/lib/itineraryData');
                        const defaultIds = ["4-day", "5-day"];
                        
                        // 1. Seed Master Library
                        for (const place of masterPlaces) {
                            await setDoc(doc(db, "places", place.id), place);
                        }

                        // 2. Seed Itineraries
                        for (const planId of defaultIds) {
                           const days = mockData[planId];
                           const places = mockData.places?.[planId] || [];
                           
                           await setDoc(doc(db, "itineraries", planId), {
                             id: planId,
                             name: `${planId} Plan`,
                             isAvailableForAdmin: true,
                             days: days,
                             places: places
                           });
                        }
                        showNotify('success');
                        setTimeout(() => window.location.reload(), 1500);
                    } catch (error) {
                        console.error("Restoration failed:", error);
                        showNotify('error');
                        setIsSyncing(false);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/10",
                    isSyncing ? "opacity-50 cursor-not-allowed" : "bg-white/5 hover:bg-white/10"
                  )}
                >
                  {isSyncing ? "Syncing..." : "Restore Templates"}
                </button>
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
                   <button 
                     onClick={() => setView('plans')}
                     className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", view === 'plans' ? "bg-purple-600 shadow-lg" : "opacity-40")}
                   >Plans</button>
                   <button 
                     onClick={() => setView('library')}
                     className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", view === 'library' ? "bg-purple-600 shadow-lg" : "opacity-40")}
                   >Library</button>
                </div>
                <button 
                  onClick={view === 'plans' ? createNewPlan : () => {
                    const id = "place-" + Date.now();
                    saveMasterPlace({
                        id,
                        name: "New Global Spot",
                        category: "Landmark",
                        coords: [76.2673, 9.9312],
                        image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2",
                        desc: "New global place description"
                    });
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                >
                  <Plus size={16} /> {view === 'plans' ? "New Plan" : "New Library Place"}
                </button>
              </div>
            </div>

            {view === 'plans' ? (
              <div className="grid grid-cols-1 gap-6">
                {itineraries.length === 0 && (
                  <div className="text-center py-20 bg-white/5 border border-white/5 inline-block rounded-3xl">
                    <p className="opacity-50 text-sm font-black uppercase tracking-widest">No Itineraries Found</p>
                  </div>
                )}
                {itineraries.map(plan => (
                  <div key={plan.id} className="bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col">
                    <div className="relative group">
                      {/* Expansion Trigger - Now a sibling, not a parent of buttons */}
                      <div 
                        className="p-8 pr-48 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                      >
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-serif font-bold">{plan.name}</h3>
                            {plan.id.startsWith('draft-') && (
                              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                Draft Mode
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-6 opacity-40">
                            <div className="flex items-center gap-2">
                              <Calendar size={12} className="text-purple-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{plan.days?.length || 0} Days</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Layers size={12} className="text-purple-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {plan.days?.reduce((acc: number, day: any) => acc + (day.events?.length || 0), 0)} Events
                              </span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest ml-auto">ID: {plan.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Control Buttons - Absolute Positioned to sit on top of the header safely */}
                      <div className="absolute top-1/2 -translate-y-1/2 right-8 z-[100] flex items-center gap-4">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAvailability(plan.id, plan.isAvailableForAdmin);
                          }}
                          className={cn(
                            "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                            plan.isAvailableForAdmin ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-black/20 text-white/40 border-white/10"
                          )}
                        >
                          {plan.isAvailableForAdmin ? 'Available' : 'Hidden'}
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPlan(plan);
                          }}
                          className="p-3 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-inner"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicatePlan(plan);
                          }}
                          title="Duplicate Plan"
                          className="p-3 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-inner"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await deleteDoc(doc(db, "itineraries", plan.id));
                              setItineraries(prev => prev.filter(p => p.id !== plan.id));
                              showNotify('success');
                            } catch(err) {
                              console.error("Delete Error:", err);
                              showNotify('error');
                              handleFirestoreError(err, OperationType.DELETE, `itineraries/${plan.id}`);
                            }
                          }}
                          className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
  
                    {/* Quick View Expanded Content */}
                    <AnimatePresence>
                      {expandedPlanId === plan.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/5 bg-black/20"
                        >
                          <div className="p-8 pt-0 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                              {plan.days?.map((day: any, dIndex: number) => (
                                <div key={dIndex} className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Day {dIndex + 1}</span>
                                    <span className="text-[9px] opacity-30 font-bold">{day.events?.length || 0} Events</span>
                                  </div>
                                  <h5 className="font-bold text-sm leading-tight text-white/90">{day.title}</h5>
                                  <div className="space-y-1.5 pt-2">
                                    {day.events?.slice(0, 3).map((evt: any, eIndex: number) => (
                                      <div key={eIndex} className="flex items-center gap-2 opacity-40 text-[9px] font-medium truncate">
                                        <div className="relative z-10 w-4 h-4 text-white/90 group-hover:text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                  </svg>
               </div>
                                        <span className="shrink-0">{evt.time}</span>
                                        <span className="truncate">{evt.cardTitle}</span>
                                      </div>
                                    ))}
                                    {(day.events?.length || 0) > 3 && (
                                      <p className="text-[8px] opacity-20 font-bold uppercase tracking-tighter pl-3">+ {day.events.length - 3} more activities</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {masterLibrary.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-white/5 border border-white/5 rounded-[2.5rem]">
                            <p className="opacity-30 uppercase tracking-widest text-xs font-black">Library is empty. Restore templates or add manually.</p>
                        </div>
                    )}
                    {masterLibrary.map(place => (
                        <div 
                            key={place.id} 
                            onClick={() => setEditingLibraryPlace(place)}
                            className="bg-white/5 rounded-[2rem] border border-white/10 p-6 flex gap-6 relative group cursor-pointer hover:bg-white/[0.08] transition-all"
                        >
                            <div className="w-24 h-24 rounded-2xl overflow-hidden glass shrink-0">
                                <img src={place.image} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-lg">{place.name}</h4>
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            deleteMasterPlace(place.id);
                                        }}
                                        className="relative z-20 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase tracking-widest rounded-md border border-purple-500/20">{place.category}</span>
                                    <span className="text-[9px] font-mono opacity-30">{place.coords[1]}, {place.coords[0]}</span>
                                </div>
                                <p className="text-[10px] opacity-50 line-clamp-2">{place.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
