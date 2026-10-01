import {
  Globe2,
  Mail,
  MapPin,
  Phone,
  Share2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Profile } from "../types";
import { getStableProfileUrl } from "../lib/format";
import { BrandIcon, getBrandStyle } from "./BrandIcon";

export function ProfilePreview({ profile, compact = false }: { profile: Profile; compact?: boolean }) {
  const config = useMemo(() => {
    try {
      return JSON.parse(profile.bgConfig || "{}");
    } catch {
      return { red: 0.60, green: 0.55, blue: 0.73, speed: 4.0, intensity: 1.9, mouse: true };
    }
  }, [profile.bgConfig]);

  const [mouseOffset, setMouseOffset] = useState({ x: "0%", y: "0%" });

  useEffect(() => {
    if (!config.mouse) {
      setMouseOffset({ x: "0%", y: "0%" });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const x = ((e.clientX / window.innerWidth) - 0.5) * 30;
      const y = ((e.clientY / window.innerHeight) - 0.5) * 30;
      setMouseOffset({ x: `${x.toFixed(2)}%`, y: `${y.toFixed(2)}%` });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [config.mouse]);

  const dynamicBgStyles = useMemo(() => {
    return {
      "--bg-r-mult": config.red ?? 0.60,
      "--bg-g-mult": config.green ?? 0.55,
      "--bg-b-mult": config.blue ?? 0.73,
      "--bg-speed-mult": config.speed ?? 4.0,
      "--bg-intensity": config.intensity ?? 1.9,
      "--mouse-offset-x": mouseOffset.x,
      "--mouse-offset-y": mouseOffset.y,
    } as React.CSSProperties;
  }, [config, mouseOffset]);

  const bgClass =
    profile.bgStyle === "iridescence" ? "bg-anim-iridescence" :
    profile.bgStyle === "silk" ? "bg-anim-silk" :
    profile.bgStyle === "squares" ? "bg-anim-squares" :
    profile.bgStyle === "hyperspeed" ? "bg-anim-hyperspeed" :
    "bg-anim-gradient";

  const themeClass =
    profile.theme === "daylight"
      ? "text-ink bg-white/75"
      : profile.theme === "champagne"
        ? "text-white bg-black/40"
        : "text-white bg-black/50";

  return (
    <div className="phone-shell mx-auto w-full max-w-[390px] p-2">
      <div className={`relative overflow-hidden rounded-[28px] ${bgClass} ${themeClass}`} style={dynamicBgStyles}>
        <img 
          src={profile.cover || "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80"} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80";
          }}
          alt="" 
          className="h-36 w-full object-cover opacity-75" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
        <div className="relative -mt-12 px-5 pb-5">
          <motion.img
            layout
            src={profile.avatar || "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=480&q=80"}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=480&q=80";
            }}
            alt={profile.name}
            className="h-24 w-24 rounded-[28px] border-4 border-black/30 object-cover shadow-glow"
            style={{ boxShadow: `0 0 38px ${profile.accent}33` }}
          />
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="mt-1 text-sm text-white/62">{profile.title}</p>
              <p className="text-sm text-white/45">{profile.company}</p>
            </div>
            <button
              aria-label="Share profile"
              className="premium-focus rounded-full border border-white/10 bg-white/10 p-3 text-white"
              onClick={() => navigator.clipboard.writeText(getStableProfileUrl(profile))}
            >
              <Share2 size={16} />
            </button>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/70">{profile.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/56">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
              <MapPin size={12} /> {profile.location}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
              <Globe2 size={12} /> @{profile.slug}
            </span>
          </div>
          <div className="mt-5 grid gap-2">
            {profile.ctas.map((cta) => (
              <a
                key={cta.id}
                href={cta.href}
                className={`premium-focus rounded-full px-4 py-3 text-center text-sm font-semibold ${
                  cta.style === "primary" ? "text-ink" : "border border-white/10 text-white"
                }`}
                style={cta.style === "primary" ? { backgroundColor: profile.accent } : undefined}
              >
                {cta.label}
              </a>
            ))}
          </div>
          {!compact ? (
            <>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {profile.links
                  .filter((link) => link.enabled)
                  .map((link) => {
                    const brand = getBrandStyle(link.platform);
                    const urlVal = link.url || "";
                    const formattedUrl = urlVal.startsWith("http")
                      ? urlVal
                      : `${brand.prefix}${urlVal.replace(/^@/, "")}`;
                    return (
                      <a
                        key={link.id}
                        href={formattedUrl}
                        className="premium-focus group flex items-center gap-2.5 rounded-[12px] border border-white/10 bg-white/[0.04] p-2.5 text-xs transition hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.02]"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition group-hover:scale-105"
                          style={{ background: brand.bg }}
                        >
                          <BrandIcon platform={link.platform} className="h-4 w-4" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-white truncate">{link.label}</span>
                          <span className="text-[9px] text-white/40 truncate">{link.platform}</span>
                        </div>
                      </a>
                    );
                  })}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-white/62">
                <a href={`mailto:${profile.emails[0]}`} className="flex items-center gap-2 rounded-[8px] bg-white/10 p-3">
                  <Mail size={14} />
                  Email
                </a>
                <a href={`tel:${profile.phones[0]}`} className="flex items-center gap-2 rounded-[8px] bg-white/10 p-3">
                  <Phone size={14} />
                  Phone
                </a>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
