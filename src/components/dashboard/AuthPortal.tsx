import { useState, FormEvent } from "react";
import { Lock, KeyRound, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthPortalProps {
  onCancel: () => void;
  onSuccess: (role: 'admin' | 'superadmin') => void;
}

export default function AuthPortal({ onCancel, onSuccess }: AuthPortalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const adminPass = (import.meta as any).env.VITE_ADMIN_PASSWORD || "MY_SAFE_PASSWORD";
    const superAdminPass = (import.meta as any).env.VITE_SUPERADMIN_PASSWORD || "SUPER_SECRET";
    
    if (password === adminPass) {
      sessionStorage.setItem("auth_role", "admin");
      onSuccess('admin');
    } else if (password === superAdminPass) {
      sessionStorage.setItem("auth_role", "superadmin");
      onSuccess('superadmin');
    } else {
      setError("Incorrect password. Access denied.");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md transition-colors duration-700 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass p-16 rounded-[4rem] w-full max-w-lg shadow-[0_40px_80px_rgba(0,0,0,0.5)] space-y-12 border border-white/10 relative overflow-hidden"
      >
        <button 
          onClick={onCancel}
          className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
        >
          Cancel
        </button>

        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        
        <div className="space-y-8 text-center relative z-10">
          <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-white mx-auto border border-white/20 shadow-inner group-hover:rotate-6 transition-transform duration-500">
            <KeyRound size={48} />
          </div>
          <div className="space-y-3">
            <h1 className="text-white text-5xl font-serif font-bold italic tracking-tight">Authorization Portal</h1>
            <p className="text-white/50 text-[11px] font-black uppercase tracking-[0.4em]">Restricted Access</p>
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-4 text-white">Access Key</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-white/50 focus:bg-white/10 transition-all text-center tracking-[0.5em] font-bold text-white shadow-inner"
              autoFocus
            />
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 text-red-400 text-[10px] font-bold mt-4 tracking-widest uppercase"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            type="submit"
            className="w-full bg-white hover:bg-white/90 text-black font-black py-6 rounded-3xl transition-all shadow-[0_20px_40px_rgba(255,255,255,0.2)] active:scale-95 uppercase tracking-[0.3em] text-[11px] mt-4"
          >
            Authenticate
          </button>
        </form>

        <p className="text-white opacity-20 text-[9px] text-center font-black uppercase tracking-[0.5em] pt-4">
          Secured Expedition Portal — KL 2026
        </p>
      </motion.div>
    </div>
  );
}
