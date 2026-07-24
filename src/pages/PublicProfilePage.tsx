import { ArrowLeft, ArrowUpRight, Download, Loader2, Mail, Phone, Link2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard";
import { MagneticButton } from "../components/MagneticButton";
import { getProfileUrl } from "../lib/format";
import { getProfile, getApiBaseUrl } from "../lib/api";
import type { Profile } from "../types";
import { BrandIcon, getBrandStyle } from "../components/BrandIcon";


export function PublicProfilePage() {
  const { slug, profileId } = useParams<{ slug?: string; profileId?: string }>();
  const identifier = slug || profileId;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileUrl = window.location.href;
  const vanityUrl = useMemo(() => {
    return profile ? getProfileUrl(profile.slug) : "";
  }, [profile?.slug]);

  useEffect(() => {
    if (!identifier) return;
    setLoading(true);
    getProfile(identifier)
      .then((data) => {
        setProfile(data);
        setError(null);
      })
      .catch((err: any) => {
        console.error(`Error loading profile for identifier "${identifier}":`, err);
        setError(err.message || "Profile not found");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [identifier]);

  // Log view event to backend analytics
  useEffect(() => {
    if (!profile) return;
    fetch(`${getApiBaseUrl()}/api/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: profile.id,
        type: "PROFILE_VIEW"
      })
    }).catch(() => {});
  }, [profile?.id]);

  // Direct redirect bypass — if configured, skip the profile page and redirect immediately
  useEffect(() => {
    if (!profile?.directRedirectUrl) return;
    // Small delay to ensure the analytics event fires first
    const timeout = window.setTimeout(() => {
      window.location.replace(profile.directRedirectUrl!);
    }, 150);
    return () => window.clearTimeout(timeout);
  }, [profile?.directRedirectUrl]);

  const config = useMemo(() => {
    if (!profile) return { red: 0.60, green: 0.55, blue: 0.73, speed: 4.0, intensity: 1.9, mouse: true };
    try {
      return JSON.parse(profile.bgConfig || "{}");
    } catch {
      return { red: 0.60, green: 0.55, blue: 0.73, speed: 4.0, intensity: 1.9, mouse: true };
    }
  }, [profile?.bgConfig]);

  const [mouseOffset, setMouseOffset] = useState({ x: "0%", y: "0%" });

  useEffect(() => {
    if (!config?.mouse) {
      setMouseOffset({ x: "0%", y: "0%" });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse offset from center of screen (-15% to 15% range)
      const x = ((e.clientX / window.innerWidth) - 0.5) * 30;
      const y = ((e.clientY / window.innerHeight) - 0.5) * 30;
      setMouseOffset({ x: `${x.toFixed(2)}%`, y: `${y.toFixed(2)}%` });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [config?.mouse]);

  const dynamicBgStyles = useMemo(() => {
    return {
      "--bg-r-mult": config?.red ?? 0.60,
      "--bg-g-mult": config?.green ?? 0.55,
      "--bg-b-mult": config?.blue ?? 0.73,
      "--bg-speed-mult": config?.speed ?? 4.0,
      "--bg-intensity": config?.intensity ?? 1.9,
      "--mouse-offset-x": mouseOffset.x,
      "--mouse-offset-y": mouseOffset.y,
    } as React.CSSProperties;
  }, [config, mouseOffset]);

  function saveContact() {
    if (!profile) return;
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${profile.name}`,
      `ORG:${profile.company}`,
      `TITLE:${profile.title}`,
      `TEL:${profile.phones[0] || ""}`,
      `EMAIL:${profile.emails[0] || ""}`,
      `URL:${profileUrl}`,
      "END:VCARD"
    ].join("\n");
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${profile.slug}.vcf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-signal" />
          <p className="mt-4 text-sm text-white/50">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-white px-4">
        <GlassCard className="max-w-md p-8 text-center border-pulse/20">
          <h2 className="text-2xl font-semibold text-pulse">Profile Not Found</h2>
          <p className="mt-3 text-white/60">
            The profile for custom link "/{slug || identifier}" does not exist, has been modified, or a connection issue occurred.
          </p>
          {error && (
            <p className="mt-3 text-xs font-mono text-pulse/80 bg-pulse/5 border border-pulse/10 rounded p-2.5 break-all text-left">
              Error Details: {error}
            </p>
          )}
          <div className="mt-6">
            <Link to="/">
              <MagneticButton variant="secondary">Back to tapyfi</MagneticButton>
            </Link>
          </div>
        </GlassCard>
      </main>
    );
  }

  // Map bgStyle selection to respective CSS animation class
  const bgClass =
    profile.bgStyle === "iridescence" ? "bg-anim-iridescence" :
    profile.bgStyle === "silk" ? "bg-anim-silk" :
    profile.bgStyle === "squares" ? "bg-anim-squares" :
    profile.bgStyle === "hyperspeed" ? "bg-anim-hyperspeed" :
    "bg-anim-gradient";

  const themeClass =
    profile.theme === "daylight"
      ? "bg-white/80 text-zinc-900 border-zinc-200/50"
      : "bg-black/45 text-white border-white/10";

  return (
    <main
      className={`min-h-screen relative px-4 py-8 md:py-16 transition-colors duration-500 overflow-x-hidden ${bgClass}`}
      style={dynamicBgStyles}
    >
      {/* Background grain noise layer */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />

      <div className="mx-auto max-w-5xl relative z-10">
        {/* Header Actions */}
        <div className="mb-10 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition">
            <ArrowLeft size={16} />
            tapyfi
          </Link>
          <div className="flex gap-2">
            <MagneticButton variant="secondary" className="px-3 py-1.5 text-xs min-h-8" onClick={() => navigator.clipboard.writeText(profileUrl)}>
              <Link2 size={14} className="mr-1.5" />
              Copy URL
            </MagneticButton>
            <MagneticButton variant="secondary" className="px-3 py-1.5 text-xs min-h-8" onClick={saveContact}>
              <Download size={14} className="mr-1.5" />
              Save Contact
            </MagneticButton>
          </div>
        </div>

        {/* Dynamic Card Container - Bento/Grid on desktop, centered list on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-8 md:gap-12 items-start">
          
          {/* LEFT COLUMN: Profile Header details */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
            {/* Circular Avatar Badge with glow shadow */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-28 w-28 rounded-full border-4 border-white/20 object-cover shadow-2xl"
                style={{ boxShadow: `0 0 40px ${profile.accent}30` }}
              />
              {profile.logo && (
                <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-black/60 border border-white/10 p-1.5 backdrop-blur-md flex items-center justify-center">
                  <img src={profile.logo} alt="" className="h-full w-full object-contain" />
                </div>
              )}
            </motion.div>

            {/* Profile Info */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mt-6 w-full flex flex-col items-center md:items-start"
            >
              {/* Glass container for Name */}
              <GlassCard className="px-6 py-5 w-full text-center md:text-left border border-white/10 rounded-[20px]">
                <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">{profile.name}</h1>
                
                {/* Pill Container for Job details */}
                {(profile.title || profile.company) && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/5 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-md">
                    <span>{profile.title}</span>
                    {profile.title && profile.company && <span className="text-white/30">•</span>}
                    <span>{profile.company}</span>
                  </div>
                )}
              </GlassCard>

              {/* Bio description inside another elegant Card */}
              {profile.bio && (
                <GlassCard className="mt-4 p-5 w-full text-sm leading-6 text-white/80 border border-white/5 rounded-[16px] text-center md:text-left">
                  <p>{profile.bio}</p>
                </GlassCard>
              )}

              {/* Badges for location & slug */}
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2 text-xs text-white/60 w-full">
                {profile.location && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/20 border border-white/5 px-3 py-1">
                    📍 {profile.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-black/20 border border-white/5 px-3 py-1">
                  🌐 @{profile.slug}
                </span>
              </div>
            </motion.div>

            {/* Quick email/phone quick links */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mt-5 w-full grid grid-cols-2 gap-3 text-xs"
            >
              {profile.emails[0] && (
                <a
                  href={`mailto:${profile.emails[0]}`}
                  className={`flex items-center justify-center gap-2 rounded-[12px] border p-3.5 font-semibold backdrop-blur-md hover:bg-white/5 transition duration-200 ${themeClass}`}
                >
                  <Mail size={14} className="text-signal" />
                  Email
                </a>
              )}
              {profile.phones[0] && (
                <a
                  href={`tel:${profile.phones[0]}`}
                  className={`flex items-center justify-center gap-2 rounded-[12px] border p-3.5 font-semibold backdrop-blur-md hover:bg-white/5 transition duration-200 ${themeClass}`}
                >
                  <Phone size={14} className="text-signal" />
                  Call
                </a>
              )}
            </motion.div>

            {/* Views count pill matching user mockup */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex justify-center md:justify-start w-full"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 border border-white/5 px-3.5 py-1.5 text-xs text-white/50 backdrop-blur-md">
                <EyeIcon />
                {profile.viewsCount ?? 0} views
              </span>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Action CTAs & Social Links */}
          <div className="flex flex-col items-stretch gap-6 w-full">
            {/* Action CTAs */}
            {profile.ctas.length > 0 && (
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="w-full grid gap-2.5"
              >
                {profile.ctas.map((cta) => (
                  <a
                    key={cta.id}
                    href={cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`premium-focus w-full rounded-full py-4 text-center text-sm font-bold shadow-md hover:scale-[1.01] transition-transform duration-150 ${
                      cta.style === "primary" ? "text-ink font-extrabold" : "border border-white/10 text-white bg-white/5 hover:bg-white/10"
                    }`}
                    style={cta.style === "primary" ? { backgroundColor: profile.accent } : undefined}
                  >
                    {cta.label}
                  </a>
                ))}
              </motion.div>
            )}

            {/* Social Links List */}
            {(profile.links || []).length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="w-full grid gap-3"
              >
                {(profile.links || [])
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
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between w-full p-4 rounded-[16px] border backdrop-blur-md transition duration-200 hover:scale-[1.01] text-left group ${themeClass}`}
                        style={{ borderColor: `${profile.accent || "#6fffe9"}15` }}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm shrink-0"
                            style={{ background: brand.bg }}
                          >
                            <BrandIcon platform={link.platform} className="h-5 w-5" />
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm md:text-base">{link.label}</span>
                            <span className="text-[10px] text-white/40">{link.platform}</span>
                          </div>
                        </div>
                        <ArrowUpRight size={18} className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-200" />
                      </a>
                    );
                  })}
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

// Compact eye views icon SVG
function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-signal">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
