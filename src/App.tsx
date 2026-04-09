/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Home, Map, Receipt, Palmtree, CloudRain, Compass, Settings, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Hero from "@/components/Hero";
import BentoGrid from "@/components/dashboard/BentoGrid";
import Itinerary from "@/components/itinerary/Itinerary";
import BudgetBreakdown from "@/components/dashboard/BudgetBreakdown";
import RouteMap from "@/components/map/RouteMap";
import WeatherOverview from "@/components/dashboard/WeatherOverview";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/dashboard/AdminPanel";
import SuperAdminPanel from "@/components/dashboard/SuperAdminPanel";
import AuthPortal from "@/components/dashboard/AuthPortal";
import { 
  db, 
  auth, 
  onAuthStateChanged, 
  onSnapshot, 
  doc, 
  collection, 
  query, 
  orderBy,
  OperationType, 
  handleFirestoreError 
} from "@/lib/firebase";

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Reset scroll on tab change to prevent map/itinerary stickiness
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Lock body scroll only when map is active for immersive app feel
    if (activeTab === "map") {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100dvh";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, [activeTab]);
  const [authRole, setAuthRole] = useState<'none' | 'admin' | 'superadmin'>(() => {
    return (localStorage.getItem("auth_role") as 'none' | 'admin' | 'superadmin') || 'none';
  });
  const [showAuthPortal, setShowAuthPortal] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(true);
    });

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => unsubscribeAuth();
  }, [isDark]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const [itineraryDays, setItineraryDays] = useState(4); // Default to 4

  const handleAdminEntry = () => {
    const storedRole = localStorage.getItem("auth_role");
    if (storedRole === 'admin' || storedRole === 'superadmin') {
      setAuthRole(storedRole as any);
      setActiveTab('admin');
    } else {
      setShowAuthPortal(true);
    }
  };

  const activePlan = settings?.plan_type || "4-day";
  const groupSize = settings?.group_size || 8;
  
  // Filter items for the active plan (Memoized to prevent flickering on scroll)
  const activeBudget = useMemo(() => {
    if (!settings) return [];
    return budgetItems.filter(item => item.plan_type === activePlan);
  }, [budgetItems, activePlan, settings]);

  const calculatedTotal = useMemo(() => {
    return activeBudget.reduce((sum, item) => sum + (Number(item.cost) || 0), 0) || 0;
  }, [activeBudget]);


  useEffect(() => {
    if (!isAuthReady) return;

    const settingsDoc = doc(db, "trip_settings", "main");
    const unsubscribeSettings = onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSettings(data);
        
        // Also fetch day count for the active plan
        const planId = data.plan_type || "4-day";
        const planDoc = doc(db, "itineraries", planId);
        onSnapshot(planDoc, (planSnap) => {
          if (planSnap.exists()) {
            setItineraryDays(planSnap.data().days?.length || 4);
          }
        });
      } else {
        setSettings({ show_budget: true, plan_type: "4-day", group_size: 8 });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "trip_settings/main");
    });

    // Subcollection listener for realtime budget items
    const budgetItemsCollection = collection(db, "trip_settings", "main", "budget_items");
    const budgetQuery = query(budgetItemsCollection, orderBy("createdAt", "asc"));
    const unsubscribeBudget = onSnapshot(budgetQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBudgetItems(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "trip_settings/main/budget_items");
    });

    return () => {
      unsubscribeSettings();
      unsubscribeBudget();
    };
  }, [isAuthReady]);

  if (!isAuthReady || !settings) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-coconut-bg dark:bg-backwater-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coconut-palm dark:border-backwater-blue"></div>
      </div>
    );
  }

  // Data already memoized at component top level to follow Rules of Hooks

  if (showAuthPortal) {
    return (
      <AuthPortal 
        onCancel={() => setShowAuthPortal(false)} 
        onSuccess={(role) => {
          setAuthRole(role);
          setShowAuthPortal(false);
          setActiveTab('admin');
        }} 
      />
    );
  }

  // Data already memoized above at component level to follow Rules of Hooks


  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-700 font-sans selection:bg-emerald-600/20">
      
      {/* Desktop Floating Nav */}
      <nav className="hidden md:flex fixed top-8 left-1/2 -translate-x-1/2 z-50 glass px-10 py-4 rounded-full items-center gap-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-black/[0.04] dark:border-white/10 transition-all duration-700">
        <div className="flex items-center gap-3 text-emerald-700 dark:text-backwater-blue mr-6 group cursor-pointer" onClick={() => setActiveTab("overview")}>
          <Palmtree size={24} className="group-hover:rotate-12 transition-transform duration-500" />
          <span className="font-serif font-bold text-3xl tracking-tighter">KL26</span>
        </div>
        <button onClick={() => setActiveTab("overview")} className={cn("text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:opacity-100", activeTab === "overview" ? "text-emerald-700 dark:text-backwater-blue opacity-100 scale-110" : "opacity-30")}>Overview</button>
        <button onClick={() => setActiveTab("itinerary")} className={cn("text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:opacity-100", activeTab === "itinerary" ? "text-emerald-700 dark:text-backwater-blue opacity-100 scale-110" : "opacity-30")}>Itinerary</button>
        <button onClick={() => setActiveTab("map")} className={cn("text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:opacity-100", activeTab === "map" ? "text-emerald-700 dark:text-backwater-blue opacity-100 scale-110" : "opacity-30")}>Map</button>
        <button onClick={() => setActiveTab("ledger")} className={cn("text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:opacity-100", activeTab === "ledger" ? "text-emerald-700 dark:text-backwater-blue opacity-100 scale-110" : "opacity-30")}>Ledger</button>
        <button onClick={() => setActiveTab("weather")} className={cn("text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:opacity-100", activeTab === "weather" ? "text-emerald-700 dark:text-backwater-blue opacity-100 scale-110" : "opacity-30")}>Weather</button>
        
        {authRole !== 'none' && (
          <button onClick={() => setActiveTab("admin")} className={cn("text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:opacity-100 text-purple-600 dark:text-purple-400", activeTab === "admin" ? "opacity-100 scale-110" : "opacity-30")}>Settings</button>
        )}

        
        <div className="w-[1px] h-6 bg-[var(--foreground)] opacity-10 mx-4" />
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDark(!isDark)} 
            className="p-3.5 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all duration-500 text-[var(--foreground)] hover:scale-110"
            title="Toggle Theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      <main className={cn(
        "flex-1 transition-all duration-700",
        activeTab === "map" 
          ? "pb-0 space-y-0 h-[100dvh] overflow-hidden" 
          : "pb-32 md:pb-48 space-y-32 md:space-y-48",
        activeTab === "overview" ? "pt-0" : 
        activeTab === "map" ? "pt-0 md:pt-40" : 
        "pt-28 md:pt-40"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
              "mx-auto w-full space-y-32 md:space-y-48",
              activeTab === "overview" ? "px-0 max-w-none" :
              activeTab === "map" ? "px-0 md:px-12 max-w-none md:max-w-[1440px]" :
              "px-6 md:px-12 max-w-7xl"
            )}
          >
            {activeTab === "overview" && (
              <>
                <Hero planType={activePlan} groupSize={groupSize} activeBudgetTotal={calculatedTotal} dayCount={itineraryDays} />
                <div className="px-6 md:px-12 max-w-7xl mx-auto w-full">
                  <BentoGrid activeBudgetTotal={calculatedTotal} groupSize={groupSize} setActiveTab={setActiveTab} />
                </div>
              </>
            )}
            {activeTab === "itinerary" && <Itinerary planType={activePlan} />}
            {activeTab === "map" && <RouteMap activePlanId={activePlan} />}
            {activeTab === "ledger" && settings.show_budget && <BudgetBreakdown planType={activePlan} customBudget={activeBudget} groupSize={groupSize} />}
            {activeTab === "weather" && (
              <div className="max-w-5xl mx-auto">
                <WeatherOverview variant="full" />
              </div>
            )}
            {activeTab === "admin" && (
              <AdminPanel 
                initialSettings={settings} 
                budgetItems={budgetItems} 
                authRole={authRole}
                onExit={() => setActiveTab("overview")} 
              />
            )}
          </motion.div>
        </AnimatePresence>
        
      </main>
      
      <Footer onAuthTrigger={handleAdminEntry} />

      <AnimatePresence>
        {(activeTab !== "overview" || scrolled) && (
          <motion.nav 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="md:hidden fixed bottom-4 left-4 right-4 z-50 glass px-6 py-4 rounded-[2.5rem] flex items-center justify-around shadow-[0_30px_60px_rgba(0,0,0,0.2)] border-black/[0.04] dark:border-white/10"
          >
            <button onClick={() => setActiveTab("overview")} className={cn("flex flex-col items-center gap-1.5 transition-all duration-500", activeTab === "overview" ? "text-emerald-700 dark:text-backwater-blue scale-110" : "opacity-30")}>
              <Home size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
            </button>
            <button onClick={() => setActiveTab("itinerary")} className={cn("flex flex-col items-center gap-1.5 transition-all duration-500", activeTab === "itinerary" ? "text-emerald-700 dark:text-backwater-blue scale-110" : "opacity-30")}>
              <Map size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Trail</span>
            </button>
            <button onClick={() => setActiveTab("map")} className={cn("flex flex-col items-center gap-1.5 transition-all duration-500", activeTab === "map" ? "text-emerald-700 dark:text-backwater-blue scale-110" : "opacity-30")}>
              <Compass size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Map</span>
            </button>
            <button onClick={() => setActiveTab("ledger")} className={cn("flex flex-col items-center gap-1.5 transition-all duration-500", activeTab === "ledger" ? "text-emerald-700 dark:text-backwater-blue scale-110" : "opacity-30")}>
              <Receipt size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Ledger</span>
            </button>
            <button onClick={() => setActiveTab("weather")} className={cn("flex flex-col items-center gap-1.5 transition-all duration-500", activeTab === "weather" ? "text-emerald-700 dark:text-backwater-blue scale-110" : "opacity-30")}>
              <CloudRain size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Sky</span>
            </button>
            
            {authRole !== 'none' && (
              <button onClick={() => setActiveTab("admin")} className={cn("flex flex-col items-center gap-1.5 transition-all duration-500", activeTab === "admin" ? "text-purple-600 dark:text-purple-400 scale-110" : "opacity-30")}>
                <Settings size={20} />
                <span className="text-[8px] font-black uppercase tracking-widest">Settings</span>
              </button>
            )}

            
            <div className="w-[1px] h-6 bg-[var(--foreground)] opacity-10" />
            
            <button onClick={() => setIsDark(!isDark)} className="flex items-center justify-center p-2 rounded-full bg-black/5 dark:bg-white/10 opacity-60">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
