import type { PropsWithChildren } from "react";
import { cn } from "../lib/format";

type GlassCardProps = PropsWithChildren<{
  className?: string;
  subtle?: boolean;
}>;

export function GlassCard({ children, className, subtle = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "liquid-glass rounded-[8px]",
        subtle ? "bg-white/[0.04]" : "bg-white/[0.08]",
        className
      )}
    >
      {children}
    </div>
  );
}
