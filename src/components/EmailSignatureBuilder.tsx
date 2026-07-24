import { Check, Copy, Mail } from "lucide-react";
import { useMemo, useState } from "react";
import type { Profile } from "../types";
import { buildSignatureHtml } from "../lib/signature";
import { GlassCard } from "./GlassCard";
import { MagneticButton } from "./MagneticButton";

export function EmailSignatureBuilder({ profile }: { profile: Profile }) {
  const [includeQr, setIncludeQr] = useState(true);
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => buildSignatureHtml(profile, includeQr), [includeQr, profile]);

  async function copy() {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <GlassCard className="p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase text-white/45">Email signature</p>
          <h3 className="text-xl font-semibold text-white">HTML signature builder</h3>
        </div>
        <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/70">
          <input type="checkbox" checked={includeQr} onChange={(event) => setIncludeQr(event.target.checked)} />
          Include QR
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[8px] bg-white p-5 text-ink" dangerouslySetInnerHTML={{ __html: html }} />
        <div className="grid gap-3">
          <textarea
            aria-label="HTML signature code"
            className="premium-focus min-h-52 rounded-[8px] border border-white/10 bg-ink p-4 text-xs text-white/65"
            value={html}
            readOnly
          />
          <div className="flex flex-wrap gap-3">
            <MagneticButton variant="secondary" onClick={copy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy HTML"}
            </MagneticButton>
            <MagneticButton variant="ghost">
              <Mail size={16} />
              Gmail / Outlook / Apple Mail steps
            </MagneticButton>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
