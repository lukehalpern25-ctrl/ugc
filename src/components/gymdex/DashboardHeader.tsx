"use client";

import Image from "next/image";
import { getLevelForXP } from "@/lib/gymdex/constants";

interface DashboardHeaderProps {
  name: string;
  xp: number;
  streak: number;
}

export default function DashboardHeader({ name, xp, streak }: DashboardHeaderProps) {
  const level = getLevelForXP(xp);

  return (
    <div className="bg-surface/50 border-b border-border">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.webp"
              alt="Gymdex"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-base font-bold text-foreground">{name}</h1>
              <p className="text-xs text-muted">
                Lv. {level.level} {level.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-lg flame-pulse">🔥</span>
                <span className="text-sm font-bold text-foreground">{streak}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-lg">
              <span className="text-xs font-bold text-primary-light">{xp} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
