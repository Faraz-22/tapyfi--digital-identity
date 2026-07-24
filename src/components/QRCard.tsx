import QRCode from "qrcode";
import { Download, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfileUrl, getStableProfileUrl } from "../lib/format";
import type { Profile } from "../types";
import { GlassCard } from "./GlassCard";
import { MagneticButton } from "./MagneticButton";

export function QRCard({ profile }: { profile: Profile }) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const profileUrl = getStableProfileUrl(profile);
  const vanityUrl = getProfileUrl(profile.slug);

  useEffect(() => {
    QRCode.toDataURL(profileUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: profile.accent,
        light: "#050608"
      }
    }).then(setQr);
  }, [profile.accent, profileUrl]);

  function download() {
    const link = document.createElement("a");
    link.href = qr;
    link.download = `${profile.slug}-tapyfi-qr.png`;
    link.click();
  }

  function handleCopy() {
    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy QR URL:", err);
      });
  }

  return (
    <GlassCard className="p-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="rounded-[8px] border border-white/10 bg-ink p-4">
          {qr ? <img src={qr} alt={`${profile.name} QR code`} className="h-44 w-44" /> : null}
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase text-white/45">Dynamic QR</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Always synced to live identity</h3>
          <p className="mt-3 break-all text-sm text-white/58">{profileUrl}</p>
          <p className="mt-2 break-all text-xs text-white/38">Vanity URL: {vanityUrl}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <MagneticButton onClick={download} variant="secondary">
              <Download size={16} />
              PNG
            </MagneticButton>
            <MagneticButton variant="ghost" onClick={handleCopy}>
              <RefreshCcw size={16} />
              {copied ? "Copied!" : "Copy URL"}
            </MagneticButton>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
