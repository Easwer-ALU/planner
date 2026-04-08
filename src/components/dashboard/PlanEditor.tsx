import { useState } from "react";
import { Plus, Trash2, Save, X, ChevronDown, ChevronUp, Image as ImageIcon, Loader2, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { storage, ref, uploadBytes, getDownloadURL, deleteObject } from "@/lib/firebase";

const AVAILABLE_ICONS = [
  "Clock", "Train", "Ship", "Utensils", "Sunset", "Coffee", "Car", "Leaf", 
  "Home", "Camera", "Megaphone", "Sunrise", "Map", "Landmark", 
  "Navigation", "Waves", "Bird", "Mountain"
];

export default function PlanEditor({ plan: initialPlan, masterLibrary = [], onSave, onCancel }: { plan: any; masterLibrary: any[]; onSave: (p: any) => void; onCancel: () => void }) {
  // Deep clone to avoid mutating the original prop until specific save
  const [plan, setPlan] = useState({
    ...initialPlan,
    places: initialPlan.places || []
  });
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [uploadingDay, setUploadingDay] = useState<number | null>(null);
  const [uploadingPlace, setUploadingPlace] = useState<number | null>(null);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const [coordInputs, setCoordInputs] = useState<Record<number, string>>({});

  const updatePlan = (key: string, value: any) => {
    setPlan({ ...plan, [key]: value });
  };

  const addDay = () => {
    const newDay = {
      id: `day-${Date.now()}`,
      tabLabel: `Day ${plan.days.length + 1}`,
      title: "New Day Title",
      events: [],
      photos: ["https://images.unsplash.com/photo-1593693397690-362cb9666fc2"]
    };
    const updatedDays = [...plan.days, newDay];
    updatePlan("days", updatedDays);
    setExpandedDay(updatedDays.length - 1);
  };

  const deleteDay = (dayIndex: number) => {
    const updatedDays = plan.days.filter((_: any, i: number) => i !== dayIndex);
    updatePlan("days", updatedDays);
    if (expandedDay === dayIndex) setExpandedDay(null);
  };

  const updateDay = (dayIndex: number, key: string, value: any) => {
    const updatedDays = [...plan.days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], [key]: value };
    updatePlan("days", updatedDays);
  };

  const addEvent = (dayIndex: number) => {
    const updatedDays = [...plan.days];
    updatedDays[dayIndex].events.push({
      time: "10:00 AM",
      cardTitle: "New Activity",
      desc: "Provide details here.",
      icon: "Clock",
      photoIndex: 0
    });
    updatePlan("days", updatedDays);
  };

  const deleteEvent = (dayIndex: number, eventIndex: number) => {
    const updatedDays = [...plan.days];
    updatedDays[dayIndex].events = updatedDays[dayIndex].events.filter((_: any, i: number) => i !== eventIndex);
    updatePlan("days", updatedDays);
  };

  const updateEvent = (dayIndex: number, eventIndex: number, key: string, value: any) => {
    const updatedDays = [...plan.days];
    updatedDays[dayIndex].events[eventIndex] = { ...updatedDays[dayIndex].events[eventIndex], [key]: value };
    updatePlan("days", updatedDays);
  };

  const addPlace = () => {
    const newPlace = {
      id: `place-${Date.now()}`,
      name: "New Spot",
      category: "Landmark",
      coords: [76.2673, 9.9312], // Default to Kochi
      image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2",
      desc: "Spot description...",
      isRouteStop: true,
      infoUrl: ""
    };
    updatePlan("places", [...(plan.places || []), newPlace]);
  };

  const importFromLibrary = (libraryPlace: any) => {
    const newPlace = {
        ...libraryPlace,
        libraryId: libraryPlace.id,
        id: `place-${Date.now()}-${Math.random()}`, // Unique ID for this itinerary instance
        isRouteStop: true // Default to true for new imports
    };
    updatePlan("places", [...(plan.places || []), newPlace]);
    setShowLibraryPicker(false);
  };

  const syncWithLibrary = (index: number) => {
    const place = plan.places[index];
    if (!place.libraryId) return;
    const master = masterLibrary.find(p => p.id === place.libraryId);
    if (!master) {
        alert("This place was removed from the global library.");
        return;
    }
    const updatedPlaces = [...plan.places];
    updatedPlaces[index] = {
        ...updatedPlaces[index],
        name: master.name,
        category: master.category,
        coords: master.coords,
        image: master.image,
        desc: master.desc,
        infoUrl: master.infoUrl || ""
    };
    updatePlan("places", updatedPlaces);
  };

  const deletePlace = async (index: number) => {
    const place = plan.places[index];
    if (place.image && place.image.includes("firebasestorage.googleapis.com")) {
      try {
        const storageRef = ref(storage, place.image);
        await deleteObject(storageRef);
      } catch (error) {
        console.error("Failed to delete place image", error);
      }
    }
    const updatedPlaces = plan.places.filter((_: any, i: number) => i !== index);
    updatePlan("places", updatedPlaces);
  };

  const handlePlaceFileUpload = async (placeIndex: number, file: File) => {
    setUploadingPlace(placeIndex);
    try {
      const timestamp = Date.now();
      const fileName = `places/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const storageRef = ref(storage, `itineraries/${plan.id}/places/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      updatePlace(placeIndex, "image", downloadURL);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Check your connection or console (is Storage initialized?).");
    } finally {
      setUploadingPlace(null);
    }
  };

  const updatePlace = (index: number, key: string, value: any) => {
    const updatedPlaces = [...plan.places];
    // Special handling for coords array
    if (key === "coords" && Array.isArray(value)) {
        updatedPlaces[index] = { ...updatedPlaces[index], coords: value };
    } else {
        updatedPlaces[index] = { ...updatedPlaces[index], [key]: value };
    }
    updatePlan("places", updatedPlaces);
  };

  const handleFileUpload = async (dayIndex: number, file: File) => {
    setUploadingDay(dayIndex);
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const storageRef = ref(storage, `itineraries/${plan.id}/${dayIndex}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const updatedDays = [...plan.days];
      updatedDays[dayIndex].photos = [...(updatedDays[dayIndex].photos || []), downloadURL];
      updatePlan("days", updatedDays);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Check your connection or console (is Storage initialized?).");
    } finally {
      setUploadingDay(null);
    }
  };

  const handleDeletePhoto = async (dayIndex: number, photoIndex: number) => {
    const photoUrl = plan.days[dayIndex].photos[photoIndex];
    
    // 1. Delete from Firebase Storage if it's a Firebase URL
    if (photoUrl && photoUrl.includes("firebasestorage.googleapis.com")) {
      try {
        const storageRef = ref(storage, photoUrl);
        await deleteObject(storageRef);
      } catch (error) {
        console.error("Failed to delete physical file from storage", error);
      }
    }

    // 2. Remove from local state
    const updatedDays = [...plan.days];
    updatedDays[dayIndex].photos = updatedDays[dayIndex].photos.filter((_: any, i: number) => i !== photoIndex);
    
    // 3. Reset Event Indices if they point to the deleted photo or shift
    updatedDays[dayIndex].events = updatedDays[dayIndex].events.map((evt: any) => {
        if (evt.photoIndex === photoIndex) {
            return { ...evt, photoIndex: 0 };
        } else if (evt.photoIndex > photoIndex) {
            return { ...evt, photoIndex: evt.photoIndex - 1 };
        }
        return evt;
    });

    updatePlan("days", updatedDays);
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Editor Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
        <div className="space-y-4 w-full max-w-xl">
          <label className="text-[10px] uppercase font-black tracking-widest text-[#8B5CF6]">Plan Name</label>
          <input
            type="text"
            value={plan.name}
            onChange={(e) => updatePlan("name", e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-3xl font-serif font-bold focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="px-8 py-4 bg-black/20 hover:bg-black/40 rounded-full text-xs font-black uppercase tracking-widest transition-all text-white/50 hover:text-white">
            Cancel
          </button>
          <button onClick={() => onSave(plan)} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:shadow-[0_0_40px_rgba(147,51,234,0.5)] flex items-center gap-3">
            <Save size={16} /> Save Plan
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-serif font-bold text-white">Daily Itinerary</h3>
          <button onClick={addDay} className="flex items-center gap-2 px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-purple-500/20">
            <Plus size={14} /> Add Day
          </button>
        </div>

        {plan.days.length === 0 && (
          <div className="py-20 text-center border border-white/5 rounded-[2.5rem] bg-white/5">
            <p className="opacity-40 uppercase tracking-widest text-xs font-black">No days configured.</p>
          </div>
        )}

        <div className="space-y-4">
          {plan.days.map((day: any, dIndex: number) => (
            <div key={day.id ?? dIndex} className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
              {/* Day Header Trigger */}
              <div 
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedDay(expandedDay === dIndex ? null : dIndex)}
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center font-bold text-lg font-serif">
                    {dIndex + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">{day.tabLabel || `Day ${dIndex + 1}`}</h4>
                    <p className="text-sm opacity-50">{day.title || "No Title Set"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteDay(dIndex); }}
                    className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedDay === dIndex ? <ChevronUp className="opacity-50" /> : <ChevronDown className="opacity-50" />}
                </div>
              </div>

              {/* Day Content */}
              <AnimatePresence>
                {expandedDay === dIndex && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 p-6 bg-black/10 space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest opacity-50">Tab Label</label>
                        <input
                          type="text"
                          value={day.tabLabel}
                          onChange={(e) => updateDay(dIndex, "tabLabel", e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest opacity-50">Main Title</label>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => updateDay(dIndex, "title", e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50"
                        />
                      </div>
                    </div>

                    {/* Day Media Gallery */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-sm uppercase tracking-widest opacity-80 flex items-center gap-2">
                          <ImageIcon size={14} className="text-purple-400" /> Day Media Gallery
                        </h5>
                        <div className="relative">
                          <button 
                            disabled={uploadingDay === dIndex}
                            className="text-[10px] flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[#8B5CF6] transition-all border border-purple-500/10 disabled:opacity-50"
                          >
                            {uploadingDay === dIndex ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} 
                            Upload Photo
                          </button>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) handleFileUpload(dIndex, e.target.files[0]);
                                e.target.value = "";
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {day.photos?.map((url: string, pIndex: number) => (
                          <div key={pIndex} className="relative aspect-square glass rounded-xl overflow-hidden group border border-white/5">
                            <img src={url} alt={`Day ${dIndex+1} Photo ${pIndex}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {/* Index tag */}
                              <span className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[8px] font-black">{pIndex}</span>
                              <button 
                                onClick={() => handleDeletePhoto(dIndex, pIndex)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                        {(!day.photos || day.photos.length === 0) && (
                          <div className="col-span-full py-8 text-center glass rounded-2xl border border-dashed border-white/10 opacity-20 text-[10px] font-black uppercase tracking-widest">
                            No Photos Uploaded
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-sm uppercase tracking-widest opacity-80">Events Array</h5>
                        <button onClick={() => addEvent(dIndex)} className="text-[10px] flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[#8B5CF6] transition-all">
                          <Plus size={12} /> Add Event
                        </button>
                      </div>

                      {day.events?.length === 0 && (
                        <div className="text-center py-8 opacity-30 text-xs uppercase tracking-widest font-black">
                          No Events for this day.
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4">
                        {day.events?.map((evt: any, eIndex: number) => (
                          <div key={eIndex} className="bg-white/5 p-5 rounded-2xl flex flex-col gap-6 relative group border border-transparent hover:border-white/10 transition-colors">
                            <button 
                              onClick={() => deleteEvent(dIndex, eIndex)}
                              className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X size={14} />
                            </button>

                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="space-y-4 flex-1">
                                <div className="flex gap-4">
                                  <input
                                    type="text"
                                    value={evt.time}
                                    placeholder="09:00 AM"
                                    onChange={(e) => updateEvent(dIndex, eIndex, "time", e.target.value)}
                                    className="w-32 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold font-mono focus:outline-none focus:border-purple-500/50"
                                  />
                                  <input
                                    type="text"
                                    value={evt.cardTitle}
                                    placeholder="Event Title"
                                    onChange={(e) => updateEvent(dIndex, eIndex, "cardTitle", e.target.value)}
                                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-purple-500/50"
                                  />
                                </div>
                                <textarea
                                  value={evt.desc}
                                  placeholder="Event Description..."
                                  rows={2}
                                  onChange={(e) => updateEvent(dIndex, eIndex, "desc", e.target.value)}
                                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs opacity-80 focus:outline-none focus:border-purple-500/50 resize-none"
                                />
                              </div>

                              <div className="w-48 shrink-0 space-y-4">
                                <div className="space-y-2">
                                  <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Icon Type</label>
                                  <select 
                                    value={evt.icon || "Clock"} 
                                    onChange={(e) => updateEvent(dIndex, eIndex, "icon", e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 appearance-none font-bold"
                                  >
                                    {AVAILABLE_ICONS.map(iconStr => (
                                      <option key={iconStr} value={iconStr}>{iconStr}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Photo Picker */}
                                <div className="space-y-2">
                                  <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Event Media Index: {evt.photoIndex || 0}</label>
                                  <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-black/20 rounded-xl border border-white/5">
                                    {(day.photos || []).map((url: string, pIndex: number) => (
                                      <button
                                        key={pIndex}
                                        onClick={() => updateEvent(dIndex, eIndex, "photoIndex", pIndex)}
                                        className={cn(
                                          "aspect-square rounded-md overflow-hidden border-2 transition-all",
                                          evt.photoIndex === pIndex ? "border-purple-500 scale-105 shadow-lg" : "border-transparent opacity-40 hover:opacity-100 hover:scale-[1.02]"
                                        )}
                                      >
                                        <img src={url} className="w-full h-full object-cover" alt="" title={`Set as Photo ${pIndex}`} />
                                      </button>
                                    ))}
                                    {(day.photos || []).length === 0 && (
                                      <div className="col-span-full py-1 text-[8px] text-center opacity-30 font-black tracking-widest uppercase">
                                        Upload Photos First
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
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

        {/* Map Places Section */}
        <div className="space-y-6 pt-12 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-white">Map Places & Route</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowLibraryPicker(true)} 
                className="flex items-center gap-2 px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-purple-500/20"
              >
                <Layers size={14} /> From Library
              </button>
              <button onClick={addPlace} className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-500/20">
                <Plus size={14} /> Custom Spot
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showLibraryPicker && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-[#0B0914] border border-white/10 rounded-[3rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h4 className="text-2xl font-serif font-bold">Pick from Library</h4>
                                <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">Centralized Places Collection</p>
                            </div>
                            <button onClick={() => setShowLibraryPicker(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {masterLibrary.length === 0 && (
                                <div className="py-20 text-center opacity-30 text-xs font-black uppercase tracking-widest">
                                    Library is empty.
                                </div>
                            )}
                            {masterLibrary.map(lp => (
                                <button 
                                    key={lp.id}
                                    onClick={() => importFromLibrary(lp)}
                                    className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center gap-5 transition-all text-left group"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden glass shrink-0">
                                        <img src={lp.image} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-white group-hover:text-purple-400 transition-colors uppercase text-xs tracking-wider">{lp.name}</h5>
                                        <p className="text-[10px] opacity-40 line-clamp-1">{lp.desc}</p>
                                    </div>
                                    <Plus size={16} className="text-purple-400" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-4">
            {(plan.places || []).map((place: any, pIndex: number) => (
              <div key={place.id || pIndex} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex flex-col lg:flex-row gap-8 relative group">
                <button 
                  onClick={() => deletePlace(pIndex)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                >
                  <X size={14} />
                </button>

                <div className="w-full lg:w-48 shrink-0 space-y-4">
                  <div className="relative aspect-square glass rounded-[1.5rem] overflow-hidden border border-white/5">
                    <img src={place.image} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] relative">
                         {uploadingPlace === pIndex ? "Uploading..." : "Change Image"}
                         <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handlePlaceFileUpload(pIndex, e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                          />
                       </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Include in Route</label>
                    <button 
                      onClick={() => updatePlace(pIndex, "isRouteStop", !place.isRouteStop)}
                      className={cn(
                        "w-10 h-5 rounded-full transition-all relative",
                        place.isRouteStop ? "bg-emerald-500" : "bg-white/10"
                      )}
                    >
                      <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", place.isRouteStop ? "right-1" : "left-1")} />
                    </button>
                  </div>
                  {place.libraryId && (
                    <button 
                      onClick={() => syncWithLibrary(pIndex)}
                      className="w-full py-2.5 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#8B5CF6] transition-all border border-purple-500/10 flex items-center justify-center gap-2"
                    >
                        <Save size={12} /> Sync with Master
                    </button>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Place Name</label>
                        <input 
                          value={place.name} 
                          onChange={(e) => updatePlace(pIndex, "name", e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-emerald-500/50" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Category</label>
                        <select 
                          value={place.category} 
                          onChange={(e) => updatePlace(pIndex, "category", e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500/50 appearance-none"
                        >
                          <option value="Landmark">Landmark</option>
                          <option value="Nature">Nature</option>
                          <option value="Adventure">Adventure</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Food">Food</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Paste Google Coordinates (Lat, Lon)</label>
                        <input 
                          type="text"
                          placeholder="e.g. 9.9312, 76.2673"
                          value={coordInputs[pIndex] !== undefined ? coordInputs[pIndex] : `${place.coords[1]}, ${place.coords[0]}`}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCoordInputs(prev => ({ ...prev, [pIndex]: val }));
                            
                            const parts = val.split(/[,\s]+/).filter(Boolean).map(p => parseFloat(p.trim()));
                            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                                // Google is Lat, Lon -> We store Lon, Lat
                                updatePlace(pIndex, "coords", [parts[1], parts[0]]);
                            }
                          }}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500/50" 
                        />
                        <p className="text-[7px] opacity-30 italic">Tip: Right-click any spot on Google Maps to copy coordinates.</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Brief Description</label>
                        <textarea 
                          value={place.desc} 
                          rows={3}
                          onChange={(e) => updatePlace(pIndex, "desc", e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs opacity-70 focus:outline-none focus:border-emerald-500/50 resize-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Info/Wiki URL</label>
                        <input 
                          value={place.infoUrl} 
                          onChange={(e) => updatePlace(pIndex, "infoUrl", e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] opacity-50 focus:outline-none" 
                        />
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
