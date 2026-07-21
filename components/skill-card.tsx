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
        "flex w-[140px] shrink-0 flex-col gap-2 rounded-2xl border bg-card p-3 text-left transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:w-[160px]",
        selected
          ? "border-primary shadow-glow"
          : "border-border hover:border-border-accent hover:shadow-md",
      )}
      aria-pressed={selected}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-card-elevated">
        {skill.previewUrl ? (
          <img
            src={skill.previewUrl}
            alt={skill.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {skill.category}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {skill.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {skill.description}
        </p>
      </div>
    </button>
  );
}
