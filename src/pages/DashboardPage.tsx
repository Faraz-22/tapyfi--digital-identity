import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  Building2,
  CreditCard,
  Eye,
  Fingerprint,
  Globe2,
  Grid,
  ImageIcon,
  Layers,
  LayoutDashboard,
  Link as LinkIcon,
  Loader2,
  Mail,
  Menu,
  Palette,
  QrCode,
  Rocket,
  Save,
  Share2,
  Shield,
  ShoppingBag,
  Sparkles,
  Upload,
  Users,
  Wifi,
  X as XIcon
} from "lucide-react";
import type { Dispatch, DragEvent, ReactNode, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { AnalyticsChart } from "../components/AnalyticsChart";
import { EmailSignatureBuilder } from "../components/EmailSignatureBuilder";
import { GlassCard } from "../components/GlassCard";
import { LinkManager } from "../components/LinkManager";
import { MagneticButton } from "../components/MagneticButton";
import { MetricCard } from "../components/MetricCard";
import { ProductCustomizer } from "../components/ProductCustomizer";
import { ProfilePreview } from "../components/ProfilePreview";
import { QRCard } from "../components/QRCard";
import { analytics, products } from "../data/mock";
import { getProfileUrl, getStableProfileUrl, toSlug } from "../lib/format";
import { canUseWebNfc, writeProfileUrlToNfc } from "../lib/nfc";
import { getProfile, updateProfile, uploadImage, getAnalyticsSummary, generateBio, getMyProfile, getMyNfcProducts, assignNfcProduct, toggleNfcStatus } from "../lib/api";
import type { AnalyticsSummary } from "../lib/api";
import type { CartItem, Profile, ProfileLayout, ThemeMode, NfcProduct } from "../types";

type Module =
  | "overview"
  | "profile"
  | "links"
  | "appearance"
  | "nfc"
  | "signature"
  | "analytics"
  | "commerce"
  | "team"
  | "admin";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: Eye },
  { id: "links", label: "Links", icon: LinkIcon },
  { id: "appearance", label: "Design", icon: Palette },
  { id: "nfc", label: "NFC + QR", icon: Wifi },
  { id: "signature", label: "Signature", icon: Mail },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "commerce", label: "Commerce", icon: ShoppingBag },
  { id: "team", label: "Team", icon: Users },
  { id: "admin", label: "Admin", icon: Shield }
] as const;

export function DashboardPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<Module>("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const updateProfileState = useCallback((updater: SetStateAction<Profile>) => {
    setProfile(current => {
      if (!current) return current;
      return typeof updater === "function" ? (updater as Function)(current) : updater;
    });
  }, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState("Saved");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastSavedRef = useRef<string>("");

  const profileUrl = useMemo(() => {
    return profile ? getStableProfileUrl(profile) : "";
  }, [profile]);

  const vanityUrl = useMemo(() => {
    return profile ? getProfileUrl(profile.slug) : "";
  }, [profile?.slug]);

  const [copied, setCopied] = useState(false);
  const handleCopyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
      });
  }, []);

  // 1. Fetch live profile data from backend on mount (checking auth)
  useEffect(() => {
    const token = localStorage.getItem("tapyfi.auth.token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    getMyProfile()
      .then((data) => {
        setProfile(data);
        lastSavedRef.current = JSON.stringify(data);
        setError(null);
        setSaveState("Saved");
      })
      .catch((err) => {
        console.error("Failed to fetch profile on dashboard mount:", err);
        setError(err.message || "Failed to reach backend API");
        if (err.message?.includes("token") || err.message?.includes("Auth") || err.message?.includes("failed")) {
          localStorage.removeItem("tapyfi.auth.token");
          navigate("/login");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  // 2. Real debounced auto-save function to the backend API
  useEffect(() => {
    if (!profile) return;

    const currentJson = JSON.stringify(profile);
    // Avoid double saves or saves when nothing has changed
    if (currentJson === lastSavedRef.current) return;

    setSaveState("Saving...");
    const profileToSave = profile;
    const timeout = window.setTimeout(async () => {
      try {
        const saved = await updateProfile(profileToSave.slug, profileToSave);
        // Only update local state if the user hasn't typed anything else in the meantime
        setProfile(current => {
          if (!current) return current;
          // If the user modified the profile while the save was in flight, do NOT overwrite it
          if (JSON.stringify(current) === JSON.stringify(profileToSave)) {
            lastSavedRef.current = JSON.stringify(saved);
            return saved;
          }
          // Otherwise, just update the lastSavedRef but keep the user's fresh keystrokes!
          lastSavedRef.current = JSON.stringify(saved);
          return current;
        });
        setSaveState("Autosaved");
      } catch (err: any) {
        console.error("Autosave failed:", err);
        setSaveState(err.message || "Save failed");
      }
    }, 1000); // 1 second debounce for keystrokes

    return () => window.clearTimeout(timeout);
  }, [profile]);

  const handleSave = useCallback(async () => {
    if (!profile) return;
    setSaveState("Saving...");
    try {
      const saved = await updateProfile(profile.slug, profile);
      setProfile(saved);
      lastSavedRef.current = JSON.stringify(saved);
      setSaveState("Saved");
    } catch (err: any) {
      console.error("Save failed:", err);
      setSaveState(err.message || "Save failed");
    }
  }, [profile]);

  function addToCart(item: CartItem) {
    setCart((current) => [...current, item]);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-signal" />
          <p className="mt-4 text-sm text-white/60">Loading your identity OS...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white p-6">
        <div className="text-center max-w-md">
          <p className="text-lg text-pulse">Profile not found</p>
          <p className="mt-2 text-sm text-white/50">Could not retrieve default profile. Please ensure the database is seeded.</p>
          {error && (
            <p className="mt-3 text-xs font-mono text-pulse/80 bg-pulse/5 border border-pulse/10 rounded p-2.5 break-all text-left">
              Error Details: {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-ink text-white">
      {/* Mobile Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/40 p-4 backdrop-blur-xl lg:hidden sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-3">
          <img src="/assets/tapyfi-mark.svg" alt="" className="h-8 w-8 rounded-[8px]" />
          <div>
            <p className="text-xs font-semibold uppercase text-white/80">tapyfi</p>
            <p className="text-[10px] text-white/40">Identity OS</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="premium-focus rounded-full border border-white/10 bg-white/[0.06] p-2 text-white/70"
            aria-label="Toggle menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        {/* Mobile Navigation Drawer Backdrop */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Sidebar Container (Slide-in drawer on mobile, sticky sidebar on desktop) */}
        <aside className={`
          border-r border-white/10 bg-black/95 p-4 backdrop-blur-xl fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:bg-black/30 lg:z-auto
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-3">
              <img src="/assets/tapyfi-mark.svg" alt="" className="h-10 w-10 rounded-[8px]" />
              <div>
                <p className="text-sm font-semibold uppercase text-white/80">tapyfi</p>
                <p className="text-xs text-white/40">Identity OS</p>
              </div>
            </Link>
            <button
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="rounded-full border border-white/10 bg-white/[0.06] p-2 text-white/56 lg:hidden"
            >
              <XIcon size={16} />
            </button>
          </div>
          <nav className="mt-8 grid gap-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id as Module);
                  setMenuOpen(false); // Auto close drawer on click
                }}
                className={`premium-focus flex items-center gap-3 rounded-[8px] px-3 py-3 text-left text-sm transition ${
                  active === item.id ? "bg-white text-ink font-semibold" : "text-white/62 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <item.icon size={17} />
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                localStorage.removeItem("tapyfi.auth.token");
                localStorage.removeItem("tapyfi.auth.user");
                navigate("/login");
              }}
              className="premium-focus mt-2 flex w-full items-center gap-3 rounded-[8px] px-3 py-3 text-left text-sm text-pulse bg-pulse/5 border border-pulse/10 transition hover:bg-pulse/15"
            >
              <LogOut size={17} />
              Logout
            </button>
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <GlassCard className="p-4">
              <p className="text-xs uppercase text-white/42">Live URL</p>
              <p className="mt-2 break-all text-sm text-white/72">{profileUrl}</p>
              <p className="mt-2 break-all text-xs text-white/38">Vanity: {vanityUrl}</p>
              <div className="mt-4 flex gap-2">
                <MagneticButton variant="secondary" className="min-h-9 px-3 py-2 text-xs" to={`/profile/${profile.slug}`}>
                  Open
                </MagneticButton>
                <MagneticButton variant="ghost" className="min-h-9 px-3 py-2 text-xs" onClick={() => handleCopyUrl(profileUrl)}>
                  {copied ? "Copied!" : "Copy"}
                </MagneticButton>
              </div>
            </GlassCard>
          </div>
        </aside>

        {/* Content Section */}
        <section className="noise min-w-0 p-4 md:p-6 xl:p-8">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase text-signal">Authenticated dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold md:text-5xl">{navItems.find((item) => item.id === active)?.label}</h1>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <MagneticButton variant="secondary" onClick={handleSave}>
                <Save size={16} />
                {saveState}
              </MagneticButton>
              <MagneticButton to="/shop" variant="ghost">
                <ShoppingBag size={16} />
                Cart {cart.length}
              </MagneticButton>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {active === "overview" ? <Overview profile={profile} setActive={setActive} /> : null}
              {active === "profile" ? <ProfileEditor profile={profile} setProfile={updateProfileState} /> : null}
              {active === "links" ? <Split title="Link management" profile={profile}><LinkManager profile={profile} setProfile={updateProfileState} /></Split> : null}
              {active === "appearance" ? <AppearanceEditor profile={profile} setProfile={updateProfileState} /> : null}
              {active === "nfc" ? <NfcQrPanel profile={profile} setProfile={updateProfileState} /> : null}
              {active === "signature" ? <EmailSignatureBuilder profile={profile} /> : null}
              {active === "analytics" ? <AnalyticsDeepDive profile={profile} /> : null}
              {active === "commerce" ? <CommercePanel onAdd={addToCart} /> : null}
              {active === "team" ? <TeamPanel /> : null}
              {active === "admin" ? <AdminPanelLite /> : null}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

function Overview({ profile, setActive }: { profile: Profile; setActive: (module: Module) => void }) {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    getAnalyticsSummary(profile.id)
      .then(setStats)
      .catch(() => setStats(null));
  }, [profile.id]);

  const dynamicChartData = useMemo(() => {
    if (!stats) return analytics; // Fallback to mock while loading
    if (stats.taps === 0 && stats.scans === 0 && stats.clicks === 0) {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
        label: day, taps: 0, scans: 0, clicks: 0
      }));
    }
    // Simple distribution curve to make the chart dynamic based on real totals
    const dist = [0.12, 0.18, 0.22, 0.15, 0.18, 0.10, 0.05];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => ({
      label: day,
      taps: Math.round(stats.taps * dist[i]),
      scans: Math.round(stats.scans * dist[i]),
      clicks: Math.round(stats.clicks * dist[i])
    }));
  }, [stats]);

  const fmt = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="NFC taps" value={fmt(stats?.taps ?? 0)} delta="Live" icon={Fingerprint} />
        <MetricCard label="QR scans" value={fmt(stats?.scans ?? 0)} delta="Live" icon={QrCode} />
        <MetricCard label="Link clicks" value={fmt(stats?.clicks ?? 0)} delta="Live" icon={Activity} />
        <MetricCard label="Profile views" value={fmt(stats?.views ?? 0)} delta="Live" icon={Eye} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <AnalyticsChart data={dynamicChartData} />
        <GlassCard className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-white/45">Live preview</p>
              <h2 className="text-xl font-semibold">Public profile</h2>
            </div>
            <button onClick={() => setActive("profile")} className="premium-focus rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink">
              Edit
            </button>
          </div>
          <ProfilePreview profile={profile} compact />
        </GlassCard>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {([
          ["AI bios", "Generate profile copy from role, tone, and audience.", Brain],
          ["Push notifications", "Notify profile owners after qualified scans.", Bell],
          ["Enterprise mode", "Teams, branches, permissions, SSO, and audits.", Building2]
        ] as const).map(([title, copy, Icon]) => (
          <GlassCard key={String(title)} className="p-5">
            <Icon className="text-ember" size={22} />
            <h3 className="mt-5 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/54">{copy}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function ProfileEditor({ profile, setProfile }: { profile: Profile; setProfile: Dispatch<SetStateAction<Profile>> }) {
  const [showAiBio, setShowAiBio] = useState(false);
  const [bioRole, setBioRole] = useState(profile.title || "");
  const [bioSkills, setBioSkills] = useState("");
  const [bioTone, setBioTone] = useState("Professional");
  const [bioOptions, setBioOptions] = useState<string[]>([]);
  const [bioLoading, setBioLoading] = useState(false);

  async function handleGenerate() {
    setBioLoading(true);
    setBioOptions([]);
    try {
      const result = await generateBio({
        role: bioRole || profile.title || "Professional",
        skills: bioSkills || "technology, innovation",
        tone: bioTone,
        company: profile.company,
        name: profile.name
      });
      setBioOptions(result.options);
    } catch (err) {
      console.error("Bio generation failed:", err);
      setBioOptions(["Failed to generate bios. Please check that the API server is running."]);
    } finally {
      setBioLoading(false);
    }
  }

  return (
    <Split title="Live profile editor" profile={profile}>
      <GlassCard className="p-5">
        <div className="grid gap-4">
          <Field label="Name" value={profile.name} onChange={(name) => setProfile((current) => ({ ...current, name }))} />
          <Field label="Username / custom slug" value={profile.slug} onChange={(slug) => setProfile((current) => ({ ...current, slug: toSlug(slug) }))} />
          <Field label="Professional title" value={profile.title} onChange={(title) => setProfile((current) => ({ ...current, title }))} />
          <Field label="Company" value={profile.company} onChange={(company) => setProfile((current) => ({ ...current, company }))} />
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/72">Bio / about</label>
              <button
                type="button"
                onClick={() => setShowAiBio(!showAiBio)}
                className="inline-flex items-center gap-1.5 rounded-full bg-signal/15 border border-signal/20 px-3 py-1 text-xs font-semibold text-signal hover:bg-signal/25 transition"
              >
                <Brain size={12} />
                {showAiBio ? "Close AI" : "Generate with AI"}
              </button>
            </div>
            <textarea
              className="premium-focus min-h-32 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-white"
              value={profile.bio}
              onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))}
            />

            {/* AI Bio Helper Panel */}
            <AnimatePresence>
              {showAiBio && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-[12px] border border-signal/15 bg-signal/[0.04] p-4 grid gap-3">
                    <p className="text-xs uppercase font-semibold text-signal tracking-wider">AI Bio Writer</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="grid gap-1.5 text-xs text-white/60">
                        Role / Title
                        <input
                          className="premium-focus rounded-[8px] border border-white/10 bg-white/[0.06] px-2.5 py-2 text-sm text-white"
                          value={bioRole}
                          onChange={(e) => setBioRole(e.target.value)}
                          placeholder="e.g. Product Designer"
                        />
                      </label>
                      <label className="grid gap-1.5 text-xs text-white/60">
                        Key Skills
                        <input
                          className="premium-focus rounded-[8px] border border-white/10 bg-white/[0.06] px-2.5 py-2 text-sm text-white"
                          value={bioSkills}
                          onChange={(e) => setBioSkills(e.target.value)}
                          placeholder="e.g. UX, Branding, Strategy"
                        />
                      </label>
                      <label className="grid gap-1.5 text-xs text-white/60">
                        Tone
                        <select
                          className="premium-focus rounded-[8px] border border-white/10 bg-white/[0.06] px-2.5 py-2 text-sm text-white"
                          value={bioTone}
                          onChange={(e) => setBioTone(e.target.value)}
                        >
                          {["Professional", "Creative", "Confident", "Friendly", "Minimalist"].map((t) => (
                            <option key={t} value={t} className="bg-ink">{t}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={bioLoading}
                      className="premium-focus mt-1 inline-flex items-center justify-center gap-2 rounded-[8px] bg-signal px-4 py-2.5 text-sm font-bold text-ink transition hover:brightness-110 disabled:opacity-50"
                    >
                      {bioLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {bioLoading ? "Generating..." : "Generate 3 Options"}
                    </button>

                    {/* Generated options */}
                    {bioOptions.length > 0 && (
                      <div className="grid gap-2 mt-2">
                        <p className="text-xs text-white/40">Click any option to apply it:</p>
                        {bioOptions.map((option, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setProfile((current) => ({ ...current, bio: option }));
                              setShowAiBio(false);
                            }}
                            className="text-left rounded-[8px] border border-white/10 bg-white/[0.04] p-3 text-sm text-white/80 leading-6 hover:bg-white/[0.08] hover:border-signal/20 transition"
                          >
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-signal mb-1">
                              Option {idx + 1}
                            </span>
                            <br />
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Location" value={profile.location} onChange={(location) => setProfile((current) => ({ ...current, location }))} />
            <Field label="Website" value={profile.website} onChange={(website) => setProfile((current) => ({ ...current, website }))} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primary phone" value={profile.phones[0] || ""} onChange={(phone) => setProfile((current) => ({ ...current, phones: [phone, ...current.phones.slice(1)] }))} />
            <Field label="Primary email" value={profile.emails[0] || ""} onChange={(email) => setProfile((current) => ({ ...current, emails: [email, ...current.emails.slice(1)] }))} />
          </div>
          <ImageUploadField
            id="profile-photo-upload"
            label="Profile photo"
            value={profile.avatar}
            onChange={(avatar) => setProfile((current) => ({ ...current, avatar }))}
          />
          <ImageUploadField
            id="cover-image-upload"
            label="Cover image"
            value={profile.cover}
            wide
            onChange={(cover) => setProfile((current) => ({ ...current, cover }))}
          />
        </div>
      </GlassCard>
    </Split>
  );
}

function AppearanceEditor({ profile, setProfile }: { profile: Profile; setProfile: Dispatch<SetStateAction<Profile>> }) {
  const bgOptions = [
    { id: "gradient", label: "Gradient", desc: "Basic Linear", icon: Palette },
    { id: "iridescence", label: "Iridescence", desc: "Fluid Color", icon: Sparkles },
    { id: "silk", label: "Silk", desc: "Soft Waves", icon: Layers },
    { id: "squares", label: "Squares", desc: "Pixel Grid", icon: Grid },
    { id: "hyperspeed", label: "Hyperspeed", desc: "Motion Stars", icon: Rocket }
  ];

  const config = useMemo(() => {
    try {
      return JSON.parse(profile.bgConfig || "{}");
    } catch {
      return { red: 0.60, green: 0.55, blue: 0.73, speed: 4.0, intensity: 1.9, mouse: true };
    }
  }, [profile.bgConfig]);

  const updateConfig = (key: string, value: any) => {
    const next = { ...config, [key]: value };
    setProfile((current) => ({
      ...current,
      bgConfig: JSON.stringify(next)
    }));
  };

  return (
    <Split title="Live customization engine" profile={profile}>
      <div className="grid gap-5">
        <GlassCard className="p-5 border-white/10">
          <div className="grid gap-5">
            {/* Color schemes */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2 text-sm text-white/72 font-semibold">
                <span>Accent Color</span>
                <div className="flex items-center gap-2">
                  <div className="relative h-12 w-12 rounded-[8px] border border-white/10 bg-transparent overflow-hidden cursor-pointer shrink-0">
                    <input
                      type="color"
                      className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                      value={profile.accent}
                      onChange={(event) => setProfile((current) => ({ ...current, accent: event.target.value }))}
                    />
                    <div className="h-full w-full" style={{ backgroundColor: profile.accent }} />
                  </div>
                  <input
                    type="text"
                    maxLength={7}
                    className="premium-focus h-12 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-white font-mono text-sm uppercase"
                    value={profile.accent}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value.startsWith('#')) {
                        setProfile((current) => ({ ...current, accent: value }));
                      } else {
                        setProfile((current) => ({ ...current, accent: `#${value}` }));
                      }
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-2 text-sm text-white/72 font-semibold">
                <span>Secondary Accent</span>
                <div className="flex items-center gap-2">
                  <div className="relative h-12 w-12 rounded-[8px] border border-white/10 bg-transparent overflow-hidden cursor-pointer shrink-0">
                    <input
                      type="color"
                      className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                      value={profile.secondaryAccent}
                      onChange={(event) => setProfile((current) => ({ ...current, secondaryAccent: event.target.value }))}
                    />
                    <div className="h-full w-full" style={{ backgroundColor: profile.secondaryAccent }} />
                  </div>
                  <input
                    type="text"
                    maxLength={7}
                    className="premium-focus h-12 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-white font-mono text-sm uppercase"
                    value={profile.secondaryAccent}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value.startsWith('#')) {
                        setProfile((current) => ({ ...current, secondaryAccent: value }));
                      } else {
                        setProfile((current) => ({ ...current, secondaryAccent: `#${value}` }));
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Layouts and Themes */}
            <Segmented
              label="Theme mode"
              value={profile.theme}
              options={["midnight", "champagne", "daylight"]}
              onChange={(theme) => setProfile((current) => ({ ...current, theme: theme as ThemeMode }))}
            />
            <Segmented
              label="Profile layout"
              value={profile.layout}
              options={["halo", "editorial", "stack"]}
              onChange={(layout) => setProfile((current) => ({ ...current, layout: layout as ProfileLayout }))}
            />
          </div>
        </GlassCard>

        {/* Background Animation settings */}
        <GlassCard className="p-5 border-white/10">
          <div className="grid gap-5">
            <div>
              <p className="text-xs uppercase text-white/45 mb-1 font-semibold">Background Settings</p>
              <h3 className="text-lg font-semibold text-white">Background Style</h3>
            </div>
            
            {/* Style Choices */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {bgOptions.map((opt) => {
                const isSelected = profile.bgStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setProfile((current) => ({ ...current, bgStyle: opt.id }))}
                    className={`premium-focus flex flex-col items-center justify-center rounded-[12px] border p-3.5 text-center transition ${
                      isSelected
                        ? "border-signal bg-signal/15 text-signal font-semibold"
                        : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
                    }`}
                  >
                    <opt.icon size={18} className={isSelected ? "text-signal" : "text-white/40"} />
                    <span className="text-xs mt-2 capitalize font-semibold tracking-tight">{opt.label}</span>
                    <span className="text-[9px] opacity-40 mt-0.5">{opt.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Sliders for Dynamic Styles */}
            {profile.bgStyle !== "gradient" && (
              <div className="grid gap-4 bg-white/[0.02] border border-white/5 rounded-[12px] p-4 mt-1">
                {profile.bgStyle === "iridescence" && (
                  <>
                    <p className="text-xs uppercase text-white/40 font-semibold tracking-wider">Iridescence Colors (RGB 0-1)</p>
                    <Slider label="Red Offset" value={config.red ?? 0.60} min={0} max={1} step={0.01} onChange={(v) => updateConfig("red", v)} />
                    <Slider label="Green Offset" value={config.green ?? 0.55} min={0} max={1} step={0.01} onChange={(v) => updateConfig("green", v)} />
                    <Slider label="Blue Offset" value={config.blue ?? 0.73} min={0} max={1} step={0.01} onChange={(v) => updateConfig("blue", v)} />
                    <div className="h-px bg-white/5 my-1" />
                  </>
                )}
                
                <p className="text-xs uppercase text-white/40 font-semibold tracking-wider">Animation Parameters</p>
                <Slider
                  label="Animation Speed"
                  value={config.speed ?? 4.0}
                  min={0.1}
                  max={10.0}
                  step={0.1}
                  format={(v) => `${v.toFixed(1)}x`}
                  onChange={(v) => updateConfig("speed", v)}
                />
                <Slider
                  label="Intensity / Opacity"
                  value={config.intensity ?? 1.9}
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  format={(v) => v.toFixed(1)}
                  onChange={(v) => updateConfig("intensity", v)}
                />
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                  <span className="text-xs font-semibold text-white/50">Mouse Interaction</span>
                  <ToggleSwitch
                    checked={config.mouse ?? true}
                    onChange={(v) => updateConfig("mouse", v)}
                    label=""
                  />
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Autosync details info */}
        <GlassCard className="p-4 border-white/10">
          <p className="text-xs font-semibold text-white">Autosync</p>
          <p className="mt-1.5 text-xs leading-5 text-white/50">
            Your edits are automatically saved to the database. Updates will sync instantly to all cards, email signatures, and active QR codes.
          </p>
        </GlassCard>
      </div>
    </Split>
  );
}

function NfcQrPanel({ profile, setProfile }: { profile: Profile; setProfile: Dispatch<SetStateAction<Profile>> }) {
  const [status, setStatus] = useState("Ready to write the live profile URL.");
  const profileUrl = getStableProfileUrl(profile);
  const vanityUrl = getProfileUrl(profile.slug);
  const hasRedirect = Boolean(profile.directRedirectUrl);

  const [copied, setCopied] = useState(false);
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
      });
  };

  const [cards, setCards] = useState<NfcProduct[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [newTagId, setNewTagId] = useState("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    setLoadingCards(true);
    try {
      const data = await getMyNfcProducts();
      setCards(data);
    } catch (err) {
      console.error("Failed to load cards:", err);
    } finally {
      setLoadingCards(false);
    }
  }

  async function handleToggleActive(cardId: string, currentStatus: boolean) {
    try {
      const updated = await toggleNfcStatus(cardId, !currentStatus);
      setCards((prev) => prev.map((c) => (c.id === cardId ? updated : c)));
    } catch (err) {
      console.error("Failed to toggle NFC active status:", err);
    }
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagId.trim()) return;
    setClaiming(true);
    setStatus("Claiming card...");
    try {
      const assigned = await assignNfcProduct(profile.id, newTagId.trim());
      setNewTagId("");
      await loadCards();
      setStatus(`Successfully claimed card: ${assigned.id}`);
    } catch (err: any) {
      setStatus(err.message || "Failed to claim NFC product.");
    } finally {
      setClaiming(false);
    }
  }

  async function writeNfc() {
    try {
      setStatus("Waiting for NFC card...");
      await writeProfileUrlToNfc(profileUrl);
      setStatus("NFC card written successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to write NFC card.");
    }
  }

  return (
    <div className="grid gap-5">
      {/* Direct Routing Override */}
      <GlassCard className="p-5 border-signal/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-signal font-semibold">Direct Routing</p>
            <h3 className="mt-1 text-lg font-semibold">Redirect visitors instantly</h3>
            <p className="mt-2 text-sm text-white/50 leading-6">
              When enabled, anyone who taps your NFC card or scans your QR code will be redirected
              straight to this URL instead of seeing your tapyfi profile page.
            </p>
          </div>
          <ToggleSwitch
            checked={hasRedirect}
            onChange={(checked) => {
              if (!checked) {
                setProfile((c) => ({ ...c, directRedirectUrl: null }));
              }
            }}
            label=""
          />
        </div>
        <div className="mt-4">
          <label className="grid gap-2 text-sm text-white/72">
            Redirect URL
            <input
              className="premium-focus rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2.5 text-white placeholder:text-white/30"
              placeholder="https://calendly.com/your-name"
              value={profile.directRedirectUrl || ""}
              onChange={(e) => setProfile((c) => ({ ...c, directRedirectUrl: e.target.value || null }))}
            />
          </label>
          {hasRedirect && (
            <p className="mt-3 text-xs text-signal/80">
              ✓ Active — visitors will be redirected to {profile.directRedirectUrl}
            </p>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-xs uppercase text-white/45">NFC writer</p>
            <h2 className="mt-2 text-3xl font-semibold">Store only the live URL on the chip.</h2>
            <p className="mt-4 break-all text-white/60">{profileUrl}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <MagneticButton onClick={writeNfc}>
                <Wifi size={16} />
                Write to NFC
              </MagneticButton>
              <MagneticButton variant="secondary" onClick={() => handleCopyUrl(profileUrl)}>
                <Share2 size={16} />
                {copied ? "Copied!" : "Copy NFC URL"}
              </MagneticButton>
            </div>
            <p className="mt-3 break-all text-xs text-white/38">Vanity URL remains available: {vanityUrl}</p>
            <p className="mt-4 text-sm text-white/52">
              Browser support: {canUseWebNfc() ? "Web NFC available" : "Use Chrome on Android or NFC Tools app fallback"}
            </p>
            <p className="mt-2 text-sm text-signal">{status}</p>

            {/* Claim Card Form */}
            <form onSubmit={handleClaim} className="mt-8 border-t border-white/5 pt-6">
              <p className="text-xs uppercase text-white/45 font-semibold">Register Physical NFC Card</p>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter Tag / Serial ID (e.g. TF-7798)"
                  className="premium-focus flex-1 rounded-[8px] border border-white/10 bg-white/[0.06] px-3.5 py-2 text-sm text-white placeholder:text-white/30"
                  value={newTagId}
                  onChange={(e) => setNewTagId(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={claiming}
                  className="rounded-[8px] bg-signal px-4 text-sm font-semibold text-ink transition hover:brightness-110 disabled:opacity-50"
                >
                  {claiming ? "Claiming..." : "Claim Card"}
                </button>
              </div>
            </form>
          </div>

          <div>
            <p className="text-xs uppercase text-white/45 mb-4">My NFC Products</p>
            {loadingCards ? (
              <div className="text-center py-6 text-white/40 text-xs">Loading physical cards...</div>
            ) : cards.length === 0 ? (
              <div className="rounded-[8px] border border-white/5 bg-white/[0.02] p-6 text-center text-xs text-white/40 leading-relaxed">
                No physical tags claimed yet.<br />Enter your product's Tag ID on the left to register it.
              </div>
            ) : (
              <div className="grid gap-3">
                {cards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between rounded-[8px] border border-white/10 bg-white/[0.05] p-4">
                    <div>
                      <p className="font-medium">{card.id}</p>
                      <p className="text-[11px] text-white/45 truncate max-w-[150px]">SKU: {card.productSku}</p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(card.id, card.active)}
                      className={`rounded-full px-3 py-1 text-xs transition font-semibold ${
                        card.active ? "bg-leaf/15 text-leaf hover:bg-leaf/25" : "bg-pulse/15 text-pulse hover:bg-pulse/25"
                      }`}
                    >
                      {card.active ? "Active" : "Paused"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
      <QRCard profile={profile} />
    </div>
  );
}

function AnalyticsDeepDive({ profile }: { profile: Profile }) {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAnalyticsSummary(profile.id)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [profile.id]);

  const deviceString = useMemo(() => {
    if (!stats || !stats.devices || Object.keys(stats.devices).length === 0) {
      return "No data recorded yet.";
    }
    return Object.entries(stats.devices)
      .map(([device, pct]) => `${device.toUpperCase()}: ${pct}%`)
      .join(" · ");
  }, [stats]);

  const geoString = useMemo(() => {
    if (!stats || !stats.topCities || stats.topCities.length === 0) {
      return "No scans from unique locations yet.";
    }
    return stats.topCities.join(", ");
  }, [stats]);

  return (
    <div className="grid gap-5">
      <AnalyticsChart data={analytics} />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Device tracking", loading ? "Loading..." : deviceString],
          ["Geo analytics", loading ? "Loading..." : geoString],
          ["Top links", "LinkedIn, WhatsApp, portfolio, booking"]
        ].map(([title, copy]) => (
          <GlassCard key={title} className="p-5">
            <p className="text-lg font-semibold">{title}</p>
            <p className="mt-2 text-sm text-white/54 leading-6">{copy}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function CommercePanel({ onAdd }: { onAdd: (item: CartItem) => void }) {
  const [product] = useState(products[1]);
  return (
    <div className="grid gap-5">
      <ProductCustomizer product={product} onAdd={onAdd} />
      <GlassCard className="p-5">
        <p className="text-xs uppercase text-white/45">Checkout architecture</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {["Cart", "Coupons", "Shipping", "Stripe/Razorpay"].map((item) => (
            <div key={item} className="rounded-[8px] border border-white/10 bg-white/[0.05] p-4 text-sm text-white/70">
              {item}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function TeamPanel() {
  return (
    <div className="grid gap-5">
      <GlassCard className="p-5">
        <p className="text-xs uppercase text-white/45">Team accounts</p>
        <h2 className="mt-2 text-3xl font-semibold">Enterprise identity governance</h2>
        <div className="mt-5 grid gap-3">
          {["Sales team", "Founder office", "Event ambassadors", "Retail branches"].map((team, index) => (
            <div key={team} className="flex items-center justify-between rounded-[8px] border border-white/10 bg-white/[0.05] p-4">
              <div>
                <p className="font-medium">{team}</p>
                <p className="text-sm text-white/45">{8 + index * 6} members · shared NFC inventory</p>
              </div>
              <MagneticButton variant="secondary" className="min-h-9 px-3 py-2 text-xs">Manage</MagneticButton>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function AdminPanelLite() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Revenue" value="₹8.4L" delta="+31%" icon={CreditCard} />
        <MetricCard label="Orders" value="486" delta="+52 this week" icon={ShoppingBag} />
        <MetricCard label="Profiles" value="18.2K" delta="+1.1K" icon={Globe2} />
      </div>
      <GlassCard className="p-5">
        <p className="text-xs uppercase text-white/45">Admin operations</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["Inventory control", "Coupon system", "Moderation queue", "Enterprise billing", "Shipping zones", "Audit logs"].map((item) => (
            <div key={item} className="rounded-[8px] border border-white/10 bg-white/[0.05] p-4 text-sm text-white/72">
              {item}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function Split({ title, profile, children }: { title: string; profile: Profile; children: ReactNode }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_430px]">
      <div>
        <p className="mb-4 text-sm text-white/48">{title}</p>
        {children}
      </div>
      {/* Hide the phone frame preview on tablets and mobiles to make the editor experience clean and spacious */}
      <div className="hidden xl:block xl:sticky xl:top-8">
        <ProfilePreview profile={profile} />
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-white/72">
      {label}
      <input
        className="premium-focus rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ImageUploadField({
  id,
  label,
  value,
  wide = false,
  onChange
}: {
  id: string;
  label: string;
  value: string;
  wide?: boolean;
  onChange: (value: string) => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Directly upload the file to the backend API and store the clean HTTPS/HTTP URL
  const handleFile = useCallback(async (file?: File) => {
    if (!file) return;
    try {
      setError("");
      setLoading(true);
      const res = await uploadImage(file);
      onChange(res.url);
    } catch (uploadError: any) {
      setError(uploadError.message || "Unable to upload image.");
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
  }

  const hasImage = Boolean(value);

  return (
    <div className="grid gap-3 rounded-[8px] border border-white/10 bg-white/[0.05] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label htmlFor={id} className="text-sm font-semibold text-white">
            {label}
          </label>
          <p id={`${id}-help`} className="mt-1 text-xs text-white/45">
            Click/drag files here to upload. Accepts JPEG, PNG, WebP, SVG.
          </p>
        </div>
        {hasImage ? (
          <div className="relative group">
            <img
              src={value}
              alt=""
              className={`${
                wide ? "h-16 w-28 rounded-[8px]" : "h-16 w-16 rounded-[18px]"
              } object-cover ring-2 ring-white/10 transition group-hover:ring-signal/40`}
            />
            <button
              type="button"
              aria-label={`Remove ${label}`}
              className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-pulse p-1 text-white shadow-md group-hover:block"
              onClick={() => onChange("")}
            >
              <XIcon size={10} />
            </button>
          </div>
        ) : (
          <div className={`flex items-center justify-center ${
            wide ? "h-16 w-28 rounded-[8px]" : "h-16 w-16 rounded-[18px]"
          } border border-dashed border-white/20 bg-white/[0.04]`}>
            <ImageIcon size={20} className="text-white/30" />
          </div>
        )}
      </div>

      {/* Accessible Drag-and-drop zone & Upload Bar */}
      <div
        role="button"
        tabIndex={0}
        aria-describedby={`${id}-help`}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[8px] border-2 border-dashed px-4 py-6 text-center outline-none transition-all focus:border-signal focus:ring-1 focus:ring-signal ${
          dragging
            ? "border-signal bg-signal/10 text-signal"
            : "border-white/15 bg-black/20 text-white/50 hover:border-white/30 hover:bg-black/30 hover:text-white/70"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-signal" />
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full origin-left animate-[pulse_1s_infinite] bg-signal" />
            </div>
          </div>
        ) : (
          <Upload size={24} className={dragging ? "text-signal" : "text-white/40"} />
        )}
        <div className="grid gap-1">
          <p className="text-sm font-medium">
            {dragging ? "Drop image here" : loading ? "Uploading..." : "Click to browse or drag file here"}
          </p>
          <p className="text-xs text-white/35">JPG, PNG, WebP, GIF, SVG up to 5MB</p>
        </div>

        {/* Direct upload bar action button */}
        <button
          type="button"
          tabIndex={-1} // Prevent double tab stops since parent is focusable
          className="mt-1 rounded-[6px] bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.15] active:scale-95"
        >
          Select File
        </button>

        <input
          ref={fileInputRef}
          id={id}
          aria-describedby={`${id}-help ${error ? `${id}-error` : ""}`}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>

      {/* URL fallback */}
      <details className="text-xs text-white/45">
        <summary className="cursor-pointer hover:text-white/60 transition">Or paste an image URL</summary>
        <input
          aria-label={`${label} URL`}
          className="premium-focus mt-3 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white"
          value={value.startsWith("data:") ? "" : value}
          placeholder="https://example.com/image.jpg"
          onChange={(event) => onChange(event.target.value)}
        />
      </details>

      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-2 text-sm text-pulse">
          <XIcon size={14} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Segmented({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-white/72">{label}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`premium-focus rounded-[8px] border px-4 py-3 text-sm capitalize transition ${
              value === option ? "border-signal bg-signal text-ink font-semibold" : "border-white/10 bg-white/[0.05] text-white/62 hover:bg-white/[0.1]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-9 h-5 bg-white/15 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-signal"></div>
      <span className="ml-2 text-xs font-semibold text-white/60">{label}</span>
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format = (v) => v.toString(),
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="grid gap-2 text-xs font-semibold text-white/50">
      <div className="flex justify-between items-center">
        <span>{label}</span>
        <span className="text-white/80 bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10px]">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full rounded-[999px] bg-white/10 appearance-none cursor-pointer accent-signal"
      />
    </label>
  );
}
