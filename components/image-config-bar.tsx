"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import {
  RATIO_OPTIONS,
  QUALITY_OPTIONS,
  type ImageRatio,
  type ImageQuality,
} from "@/lib/image-config";

gsap.registerPlugin(useGSAP);

interface ImageConfigBarProps {
  ratio: ImageRatio;
  quality: ImageQuality;
  onRatioChange: (value: ImageRatio) => void;
  onQualityChange: (value: ImageQuality) => void;
  className?: string;
}

type Section = "ratio" | "quality" | null;

const CLOSE_DURATION = 0.25;

export function ImageConfigBar({
  ratio,
  quality,
  onRatioChange,
  onQualityChange,
  className,
}: ImageConfigBarProps) {
  const [openSection, setOpenSection] = useState<Section>(null);
  const [displayedSection, setDisplayedSection] = useState<Section>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useGSAP(
    () => {
      if (!panelRef.current || !optionsRef.current) return;

      const panel = panelRef.current;
      const options = optionsRef.current.querySelectorAll("[data-option]");

      if (openSection) {
        gsap.fromTo(
          panel,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.35, ease: "power2.out" },
        );

        if (options.length > 0) {
          gsap.fromTo(
            options,
            { y: 10, opacity: 0, scale: 0.96 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.32,
              stagger: 0.04,
              ease: "back.out(1.4)",
              delay: 0.06,
            },
          );
        }
      } else {
        gsap.to(panel, {
          height: 0,
          opacity: 0,
          duration: CLOSE_DURATION,
          ease: "power2.inOut",
        });
      }
    },
    { scope: containerRef, dependencies: [openSection] },
  );

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const schedulePanelClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setDisplayedSection(null);
    }, CLOSE_DURATION * 1000);
  };

  const toggleSection = (section: Section) => {
    clearCloseTimer();

    if (openSection === section) {
      setOpenSection(null);
      schedulePanelClose();
      return;
    }

    setDisplayedSection(section);
    setOpenSection(section);
  };

  const handleSelect = (value: ImageRatio | ImageQuality) => {
    if (openSection === "ratio") {
      onRatioChange(value as ImageRatio);
    } else if (openSection === "quality") {
      onQualityChange(value as ImageQuality);
    }
    setOpenSection(null);
    schedulePanelClose();
  };

  return (
    <div ref={containerRef} className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <ConfigTrigger
          label="比例"
          value={ratio}
          description={RATIO_OPTIONS.find((o) => o.value === ratio)?.description}
          isOpen={openSection === "ratio"}
          onClick={() => toggleSection("ratio")}
        />
        <ConfigTrigger
          label="清晰度"
          value={quality}
          description={QUALITY_OPTIONS.find((o) => o.value === quality)?.description}
          isOpen={openSection === "quality"}
          onClick={() => toggleSection("quality")}
        />
      </div>

      <div ref={panelRef} className="h-0 overflow-hidden opacity-0">
        <div
          ref={optionsRef}
          className="rounded-2xl border border-border bg-card/60 p-3 backdrop-blur-md"
        >
          {displayedSection === "ratio" && (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {RATIO_OPTIONS.map((option) => (
                <RatioOptionButton
                  key={option.value}
                  option={option}
                  active={ratio === option.value}
                  onClick={() => handleSelect(option.value)}
                />
              ))}
            </div>
          )}
          {displayedSection === "quality" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUALITY_OPTIONS.map((option) => (
                <QualityOptionButton
                  key={option.value}
                  option={option}
                  active={quality === option.value}
                  onClick={() => handleSelect(option.value)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ConfigTriggerProps {
  label: string;
  value: string;
  description?: string;
  isOpen: boolean;
  onClick: () => void;
}

function ConfigTrigger({
  label,
  value,
  description,
  isOpen,
  onClick,
}: ConfigTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isOpen
          ? "border-primary/40 bg-primary/10 text-primary shadow-[0_2px_12px_rgba(99,102,241,0.14)]"
          : "border-border bg-card/50 text-foreground hover:border-primary/20 hover:bg-primary/5",
      )}
      aria-expanded={isOpen}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
      {description && (
        <span className="hidden text-muted-foreground sm:inline">· {description}</span>
      )}
      <ChevronDown
        className={cn(
          "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180",
        )}
      />
    </button>
  );
}

interface RatioOptionButtonProps {
  option: {
    label: string;
    value: ImageRatio;
    description: string;
  };
  active: boolean;
  onClick: () => void;
}

function RatioOptionButton({ option, active, onClick }: RatioOptionButtonProps) {
  return (
    <button
      type="button"
      data-option
      onClick={onClick}
      title={option.description}
      className={cn(
        "group flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-primary/30 bg-primary/10 text-primary shadow-[0_2px_12px_rgba(99,102,241,0.14)]"
          : "border-border bg-card/50 text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-foreground",
      )}
    >
      <div
        className={cn(
          "w-5 rounded-[3px] border-2 transition-colors",
          active
            ? "border-primary bg-primary/20"
            : "border-muted-foreground/40 group-hover:border-primary/50",
        )}
        style={{ aspectRatio: option.value.replace(":", "/") }}
      />
      <span className="font-semibold">{option.label}</span>
    </button>
  );
}

interface QualityOptionButtonProps {
  option: {
    label: string;
    value: ImageQuality;
    description: string;
  };
  active: boolean;
  onClick: () => void;
}

function QualityOptionButton({ option, active, onClick }: QualityOptionButtonProps) {
  return (
    <button
      type="button"
      data-option
      onClick={onClick}
      title={option.description}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-2.5 text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-primary/30 bg-primary/10 text-primary shadow-[0_2px_12px_rgba(99,102,241,0.14)]"
          : "border-border bg-card/50 text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-foreground",
      )}
    >
      <span className="font-semibold">{option.label}</span>
      <span className="text-[10px] opacity-80">{option.description}</span>
    </button>
  );
}
