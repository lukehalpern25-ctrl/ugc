"use client";

import Image from "next/image";

interface HeaderProps {
  activeTab: "steps" | "resources";
  onTabChange: (tab: "steps" | "resources") => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <div className="bg-surface/50 border-b border-border">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-0">
        {/* Logo + Title */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Image
            src="/icon.webp"
            alt="Gymdex"
            width={48}
            height={48}
            className="rounded-xl"
          />
          <div>
            <h1 className="text-xl font-bold text-foreground">Gymdex</h1>
            <p className="text-sm text-muted">UGC Creator Guide</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0">
          <button
            onClick={() => onTabChange("steps")}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
              activeTab === "steps"
                ? "border-primary text-primary-light"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Instructions
          </button>
          <button
            onClick={() => onTabChange("resources")}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
              activeTab === "resources"
                ? "border-primary text-primary-light"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Resources
          </button>
        </div>
      </div>
    </div>
  );
}
