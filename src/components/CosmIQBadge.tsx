import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function CosmIQBadge() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href="https://www.cosmiqproject.com"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed bottom-6 left-6 z-40
        flex items-center gap-2
        px-3 py-2 rounded-full
        backdrop-blur-md bg-black/40
        border border-white/10
        shadow-lg shadow-black/20
        transition-all duration-500 ease-out
        ${isHovered ? "bg-black/60 scale-105 shadow-xl shadow-white/10" : ""}
      `}
      aria-label="Built by CosmIQ"
    >
      {/* Logo Icon */}
      <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
        <img
          src="/images/cosmiq-logo-white.png"
          alt=""
          className="w-full h-full object-contain"
          style={{ filter: isHovered ? "drop-shadow(0 0 8px rgba(255,215,0,0.6))" : "none" }}
        />
      </div>

      {/* Text - expands on hover */}
      <div
        className={`
          flex items-center overflow-hidden
          transition-all duration-500 ease-out
          ${isHovered ? "max-w-[200px] opacity-100" : "max-w-[60px] opacity-90"}
        `}
      >
        <span className="text-xs font-medium whitespace-nowrap text-white/90">
          {isHovered ? "Built by " : "Built by "}
        </span>
        <span
          className={`
            text-xs font-bold whitespace-nowrap ml-1
            bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400
            bg-clip-text text-transparent
            transition-all duration-300
            ${isHovered ? "drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" : ""}
          `}
        >
          {isHovered ? "CosmIQ" : "CosmIQ"}
        </span>
      </div>

      {/* Sparkle effect on hover */}
      <Sparkles
        className={`
          w-3 h-3 text-amber-400 shrink-0
          transition-all duration-300
          ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-0"}
        `}
      />
    </a>
  );
}
