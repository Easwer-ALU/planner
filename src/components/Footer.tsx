"use client";

import Link from "next/link";
import { Palmtree } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
        <Palmtree className="text-emerald-600 mb-4 opacity-20" size={32} />
        
        <div className="text-center space-y-2">
          <p className="text-gray-400 text-sm font-medium">
            © KL 2026. All rights not reserved.
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-300 font-bold">
            Curated with vibe coding by{" "}
            <Link 
              href="/admin" 
              className="hover:text-amber-500 transition-colors cursor-default"
            >
              EASWER ALU
            </Link>
          </p>
        </div>
        
        <div className="mt-8 flex gap-6">
          <div className="w-1 h-1 rounded-full bg-gray-200"></div>
          <div className="w-1 h-1 rounded-full bg-gray-200"></div>
          <div className="w-1 h-1 rounded-full bg-gray-200"></div>
        </div>
      </div>
    </footer>
  );
}