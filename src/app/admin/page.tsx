"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Lock, Eye, EyeOff, Calendar, Receipt, Save, Plus, Trash2, Users } from "lucide-react";

export default function AdminPanel() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [settings, setSettings] = useState<any>({ show_budget: true, plan_type: "4-day", group_size: 8 });
  const [budgetList, setBudgetList] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from("trip_settings").select("*").single();
      if (data) {
        setSettings(data);
        const activeBudget = data.plan_type === "5-day" ? data.budget_5day : data.budget_4day;
        setBudgetList(activeBudget || []);
      }
    }
    if (isAuthorized) fetchSettings();
  }, [isAuthorized]);

  const toggleBudget = async () => {
    const newVal = !settings.show_budget;
    setSettings({ ...settings, show_budget: newVal });
    await supabase.from("trip_settings").update({ show_budget: newVal }).eq("id", 1);
  };

  const togglePlan = async () => {
    const nextPlan = settings.plan_type === "4-day" ? "5-day" : "4-day";
    await supabase.from("trip_settings").update({ plan_type: nextPlan }).eq("id", 1);
    const nextBudget = nextPlan === "5-day" ? settings.budget_5day : settings.budget_4day;
    setSettings({ ...settings, plan_type: nextPlan });
    setBudgetList(nextBudget || []);
  };

  const addBudgetItem = () => {
    setBudgetList([...budgetList, { category: "", cost: 0, detail: "" }]);
  };

  const removeBudgetItem = (index: number) => {
    const newList = budgetList.filter((_, i) => i !== index);
    setBudgetList(newList);
  };

  const updateBudgetItem = (index: number, field: string, value: string) => {
    const newList = [...budgetList];
    newList[index][field] = field === "cost" ? parseInt(value) || 0 : value;
    setBudgetList(newList);
  };

  const saveBudget = async () => {
    setIsSaving(true);
    const is5Day = settings.plan_type === "5-day";
    const fieldToUpdate = is5Day ? "budget_5day" : "budget_4day";

    const { error } = await supabase
      .from("trip_settings")
      .update({ [fieldToUpdate]: budgetList })
      .eq("id", 1);
    
    if (!error) {
      setSettings({ ...settings, [fieldToUpdate]: budgetList });
      alert(`Budget for ${settings.plan_type} synchronized!`);
    } else {
      alert("Error saving: " + error.message);
    }
    setIsSaving(false);
  };

  if (!isAuthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1A3326] px-6 font-sans">
        <div className="bg-white/5 p-10 rounded-[3rem] backdrop-blur-xl border border-white/10 w-full max-w-md shadow-2xl">
          <Lock className="text-[#E6A83C] mb-6" size={40} />
          <h1 className="text-white text-3xl font-serif font-bold mb-8 italic">Staff Only</h1>
          <input 
            type="password" 
            placeholder="Master Password"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white mb-6 outline-none focus:border-[#E6A83C] transition-all text-lg"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            onClick={() => password === "susu" && setIsAuthorized(true)}
            className="w-full bg-[#E6A83C] hover:bg-[#d4972f] text-[#1A3326] font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
          >
            Enter Control Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] py-20 px-6 font-sans text-[#1A3326]">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <h1 className="font-serif text-5xl font-bold tracking-tight text-[#1A3326]">Control Center</h1>
          <button 
            onClick={saveBudget}
            disabled={isSaving}
            className={`flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-95 ${isSaving ? 'bg-gray-200 text-gray-400' : 'bg-[#2C7A54] text-white hover:bg-[#1f583c]'}`}
          >
            <Save size={20} />
            {isSaving ? "Syncing..." : "Save All Changes"}
          </button>
        </div>
        
        {/* Unified Toggle Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          {/* 1. Budget Display Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#1A3326]/5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-5 mb-8">
              <div className={`p-4 rounded-2xl transition-colors ${settings.show_budget ? 'bg-[#2C7A54]/10 text-[#2C7A54]' : 'bg-red-50 text-red-600'}`}>
                {settings.show_budget ? <Eye size={24} /> : <EyeOff size={24} />}
              </div>
              <div>
                <p className="font-bold text-lg text-[#1A3326]">Budget Display</p>
                <p className={`text-sm font-medium ${settings.show_budget ? 'text-[#2C7A54]' : 'text-red-500'}`}>
                  {settings.show_budget ? 'Live on site' : 'Hidden from crew'}
                </p>
              </div>
            </div>
            <button onClick={toggleBudget} className={`w-full py-3 rounded-xl font-bold transition-all border-2 ${settings.show_budget ? 'border-red-100 text-red-600 hover:bg-red-50' : 'bg-[#2C7A54] text-white border-[#2C7A54]'}`}>
              {settings.show_budget ? 'Deactivate' : 'Activate'}
            </button>
          </div>

          {/* 2. Route Version Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#1A3326]/5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-5 mb-8">
              <div className="p-4 bg-[#E6A83C]/10 text-[#E6A83C] rounded-2xl">
                <Calendar size={24} />
              </div>
              <div>
                <p className="font-bold text-lg text-[#1A3326]">Route Version</p>
                <p className="text-[10px] text-[#E6A83C] font-black tracking-[0.2em] uppercase">Active: {settings.plan_type}</p>
              </div>
            </div>
            <button onClick={togglePlan} className="w-full py-3 bg-[#1A3326] text-white rounded-xl font-bold hover:bg-black transition-all">
              Switch to {settings.plan_type === "4-day" ? "5-day" : "4-day"}
            </button>
          </div>

          {/* 3. Group Size Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#1A3326]/5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-5 mb-8">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <Users size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-[#1A3326]">Group Size</p>
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="number" 
                    min="1"
                    value={settings.group_size || 8}
                    onChange={async (e) => {
                      const val = parseInt(e.target.value) || 1;
                      setSettings({ ...settings, group_size: val });
                      await supabase.from("trip_settings").update({ group_size: val }).eq("id", 1);
                    }}
                    className="w-16 bg-[#F9F8F6] border border-[#1A3326]/10 rounded-lg px-2 py-1.5 font-bold text-[#1A3326] outline-none focus:border-[#E6A83C] transition-all"
                  />
                  <span className="text-xs text-[#1A3326]/40 font-bold uppercase tracking-widest">Crew</span>
                </div>
              </div>
            </div>
            <div className="w-full py-2 bg-[#F9F8F6] rounded-xl border border-[#1A3326]/5 text-center">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#1A3326]/40 font-black">
                Real-time Hero Sync
              </p>
            </div>
          </div>
        </div>

        {/* Budget Editor Section */}
        <div className="bg-white p-10 rounded-[3rem] border border-[#1A3326]/5 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="bg-[#E6A83C]/10 p-3 rounded-2xl">
                <Receipt className="text-[#E6A83C]" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold leading-tight text-[#1A3326]">Budget Itinerary</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#E6A83C] mt-1">
                  Editing: {settings.plan_type} Version
                </p>
              </div>
            </div>
            <button 
              onClick={addBudgetItem}
              className="flex items-center gap-2 bg-[#2C7A54]/5 text-[#2C7A54] font-black px-6 py-3 rounded-2xl hover:bg-[#2C7A54]/10 transition-colors text-xs uppercase tracking-widest shadow-sm"
            >
              <Plus size={18} /> Add Row
            </button>
          </div>

          <div className="space-y-8">
            {budgetList.map((item, index) => (
              <div key={index} className="group relative p-8 bg-[#F9F8F6] rounded-[2.5rem] border border-[#1A3326]/5 hover:border-[#E6A83C]/30 transition-all hover:bg-white hover:shadow-xl">
                <button 
                  onClick={() => removeBudgetItem(index)}
                  className="absolute -top-3 -right-3 bg-white text-red-500 p-2.5 rounded-full border border-red-50 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 active:scale-90"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A3326]/40 block mb-3 ml-1">Category</label>
                    <input 
                      type="text"
                      value={item.category}
                      placeholder="e.g. Spice Plantation"
                      onChange={(e) => updateBudgetItem(index, 'category', e.target.value)}
                      className="w-full bg-white border border-[#1A3326]/10 rounded-2xl px-5 py-4 text-base font-bold text-[#1A3326] outline-none focus:border-[#E6A83C] focus:ring-4 focus:ring-[#E6A83C]/5 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A3326]/40 block mb-3 ml-1">Cost (₹)</label>
                    <input 
                      type="number"
                      value={item.cost}
                      placeholder="0"
                      onChange={(e) => updateBudgetItem(index, 'cost', e.target.value)}
                      className="w-full bg-white border border-[#1A3326]/10 rounded-2xl px-5 py-4 text-base font-bold text-[#1A3326] outline-none focus:border-[#E6A83C] focus:ring-4 focus:ring-[#E6A83C]/5 transition-all font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A3326]/40 block mb-3 ml-1">Notes & Details</label>
                  <input 
                    type="text"
                    value={item.detail}
                    placeholder="Brief description for the crew..."
                    onChange={(e) => updateBudgetItem(index, 'detail', e.target.value)}
                    className="w-full bg-white border border-[#1A3326]/10 rounded-2xl px-5 py-4 text-base font-medium text-[#1A3326]/80 outline-none focus:border-[#E6A83C] focus:ring-4 focus:ring-[#E6A83C]/5 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>

          {budgetList.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-[#1A3326]/10 rounded-[3rem] bg-[#F9F8F6]/50">
              <Receipt size={48} className="mx-auto text-[#1A3326]/10 mb-4" />
              <p className="text-[#1A3326]/40 font-medium">Your budget is currently empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}