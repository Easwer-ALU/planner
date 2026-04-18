import { Palmtree } from "lucide-react";

interface FooterProps {
  onAuthTrigger?: () => void;
}

export default function Footer({ onAuthTrigger }: FooterProps) {
  return (
    <footer className="py-24 bg-[var(--footer-bg)] border-t border-black/10 dark:border-white/5 rounded-t-[2.5rem] md:rounded-t-[5rem] transition-all duration-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-12 relative z-10">
        <div className="flex items-center gap-5 group cursor-default">
          <div className="w-16 h-16 bg-[var(--footer-icon)]/10 rounded-2xl flex items-center justify-center text-[var(--footer-icon)] group-hover:rotate-12 transition-transform duration-500 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
            <Palmtree size={32} />
          </div>
          <h3 className="text-4xl font-serif font-bold italic tracking-tighter bg-gradient-to-br from-[var(--footer-text)] to-[var(--footer-text)]/60 bg-clip-text text-transparent">KL 2026</h3>
        </div>
        
        <div className="text-center space-y-6">
          <p className="text-[var(--footer-sub)] text-[10px] font-black uppercase tracking-[0.5em]">
            © THE MONSOON TRAIL 2026. ALL RIGHTS NOT RESERVED.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <p className="text-[11px] uppercase tracking-[0.4em] text-[var(--footer-sub)]/80 font-black">
              Curated with vibe coding by{" "}
              <button 
                onClick={onAuthTrigger}
                className="text-[var(--footer-icon)] opacity-100 italic font-bold hover:opacity-70 transition-colors"
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
              className="text-[11px] uppercase tracking-[0.4em] text-purple-700/60 dark:text-purple-400/50 hover:opacity-100 font-black transition-colors"
            >
              Report Bug
            </button>
          </div>
        </div>
        
        <div className="flex gap-8 opacity-40">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--footer-icon)]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--footer-icon)]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--footer-icon)]"></div>
        </div>
      </div>
    </footer>
  );
}
