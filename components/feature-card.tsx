import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="group overflow-hidden hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-mint-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="mb-4 inline-flex rounded-xl bg-indigo-50/80 p-3 backdrop-blur-sm dark:bg-indigo-950/30">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </Card>
  );
}
