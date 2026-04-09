import { Palmtree } from "lucide-react";

interface FooterProps {
  onAuthTrigger?: () => void;
}

export default function Footer({ onAuthTrigger }: FooterProps) {
  return (
    <footer className="py-24 bg-[#0B1215] border-t border-white/5 rounded-t-[2.5rem] md:rounded-t-[5rem] transition-colors duration-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-12 relative z-10">
        <div className="flex items-center gap-5 group cursor-default">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:rotate-12 transition-transform duration-500 shadow-inner">
            <Palmtree size={32} />
          </div>
          <h3 className="text-4xl font-serif font-bold italic tracking-tighter text-white">KL 2026</h3>
        </div>
        
        <div className="text-center space-y-6">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">
            © THE MONSOON TRAIL 2026. ALL RIGHTS NOT RESERVED.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/20 font-black">
              Curated with vibe coding by{" "}
              <button 
                onClick={onAuthTrigger}
                className="text-[#3A8EBA] opacity-100 italic font-bold hover:text-white transition-colors"
              >
                EASWER ALU
              </button>
            </p>
            <button 
              onClick={() => {
                const jokes = [
                  "fix it yourself",
                  "observant, aren't you, you little f**ker",
                  "it's not a bug, it's a feature. deal with it.",
                  "i'm currently on vacation. try again never.",
                  "have you tried turning the internet off and on again?",
                  "my code is flawless. it's your screen that's broken."
                ];
                alert(jokes[Math.floor(Math.random() * jokes.length)]);
              }}
              className="text-[11px] uppercase tracking-[0.4em] text-purple-400/50 hover:text-purple-400 font-black transition-colors"
            >
              Report Bug
            </button>
          </div>
        </div>
        
        <div className="flex gap-8 opacity-20">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
        </div>
      </div>
    </footer>
  );
}
