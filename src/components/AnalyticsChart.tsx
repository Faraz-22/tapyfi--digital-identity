import type { AnalyticsDatum } from "../types";
import { GlassCard } from "./GlassCard";

export function AnalyticsChart({ data }: { data: AnalyticsDatum[] }) {
  const max = Math.max(...data.flatMap((item) => [item.taps, item.scans, item.clicks]));

  return (
    <GlassCard className="p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-white/45">Analytics</p>
          <h3 className="text-xl font-semibold text-white">Live connection signal</h3>
        </div>
        <div className="flex gap-3 text-xs text-white/55">
          <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-signal" />Taps</span>
          <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-ember" />Scans</span>
          <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-pulse" />Clicks</span>
        </div>
      </div>
      <div className="grid h-64 grid-cols-7 items-end gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex h-full flex-col justify-end gap-2">
            <div className="flex h-full items-end justify-center gap-1">
              <Bar value={item.taps} max={max} className="bg-signal" />
              <Bar value={item.scans} max={max} className="bg-ember" />
              <Bar value={item.clicks} max={max} className="bg-pulse" />
            </div>
            <span className="text-center text-xs text-white/45">{item.label}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  return (
    <div
      className={`min-h-3 w-full max-w-[12px] rounded-t-full ${className}`}
      style={{ height: `${Math.max(10, (value / max) * 100)}%` }}
      title={`${value}`}
    />
  );
}
