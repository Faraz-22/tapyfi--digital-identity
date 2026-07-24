import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";

type MetricCardProps = {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
};

export function MetricCard({ label, value, delta, icon: Icon }: MetricCardProps) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-white/45">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          <p className="mt-1 text-sm text-leaf">{delta}</p>
        </div>
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="rounded-[8px] border border-white/10 bg-white/[0.08] p-2 text-signal"
        >
          <Icon size={18} />
        </motion.div>
      </div>
    </GlassCard>
  );
}
