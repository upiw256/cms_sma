"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface HeadmasterGreetingProps {
  greeting: string;
  fallback: string;
}

export default function HeadmasterGreeting({ greeting, fallback }: HeadmasterGreetingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = greeting || fallback;
  const isLong = text.length > 300;

  return (
    <div className="space-y-6">
      <blockquote className="relative pl-6 border-l-[3px] border-primary/30 dark:border-primary/30">
        <p className={`text-slate-600 dark:text-slate-400 leading-relaxed italic text-lg transition-all duration-500 ${
          !isExpanded && isLong ? "line-clamp-4" : ""
        }`}>
          &ldquo;{text}&rdquo;
        </p>
      </blockquote>
      
      {isLong ? (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all duration-200 group"
        >
          {isExpanded ? (
            <>Sembunyikan <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Tampilkan Selengkapnya <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" /></>
          )}
        </button>
      ) : (
         <div className="h-4" /> // Spacer
      )}
    </div>
  );
}
