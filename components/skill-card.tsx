"use client";

import { cn } from "@/lib/utils";
import type { Skill } from "@/lib/types";

interface SkillCardProps {
  skill: Skill;
  selected?: boolean;
  onClick?: () => void;
}

export function SkillCard({ skill, selected, onClick }: SkillCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-[140px] shrink-0 flex-col justify-between rounded-2xl border bg-card/70 p-3 text-left transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background backdrop-blur-md md:w-[160px]",
        selected
          ? "border-primary shadow-glow"
          : "border-border hover:border-border-accent hover:shadow-md hover:bg-card",
      )}
      aria-pressed={selected}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {skill.name}
        </p>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {skill.description}
        </p>
      </div>
      <span className="mt-2 inline-flex w-fit items-center rounded-full bg-indigo-50/80 px-2 py-0.5 text-[10px] font-medium text-primary backdrop-blur-sm dark:bg-indigo-950/30">
        {skill.category}
      </span>
    </button>
  );
}
