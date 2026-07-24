import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Fingerprint,
  Layers3,
  QrCode,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Zap,
  ExternalLink,
  Lock
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { IdentityScene } from "../components/IdentityScene";
import { GlassCard } from "../components/GlassCard";
import { MagneticButton } from "../components/MagneticButton";

const modules = [
  {
    icon: Fingerprint,
    title: "Live Identity Engine",
    copy: "A premium public profile, visual editor, CTA layer, custom themes, and instant publishing.",
    badge: "Dynamic",
    color: "#6fffe9"
  },
  {
    icon: ScanLine,
    title: "NFC Infrastructure",
    copy: "Assign, activate, rewrite, and track NFC products while storing only the dynamic profile URL.",
    badge: "NFC Native",
    color: "#f8c66d"
  },
  {
    icon: QrCode,
    title: "QR + Signature Suite",
    copy: "Dynamic QR codes, branded styles, downloadable assets, and HTML email signatures.",
    badge: "Universal",
    color: "#ff6b6b"
  },
  {
    icon: ShoppingBag,
    title: "Luxury NFC Commerce",
    copy: "Card studio, marketplace, cart, checkout hooks, inventory, coupons, and order tracking.",
    badge: "E-Commerce",
    color: "#a78bfa"
  }
];

const story = [
  { title: "Create a profile", desc: "Build your visual presence with modern layouts, accent colors, and custom sections." },
  { title: "Customize the presence", desc: "Add dynamic links, configure direct redirects, and style animated backgrounds." },
  { title: "Write the live URL to NFC", desc: "Use the Web NFC tool inside Chrome or a dynamic QR to sync details to the chip instantly." },
  { title: "Share by tap, QR, or signature", desc: "Expose your identity to clients instantly through physical cards or digital email tags." },
  { title: "Watch analytics update", desc: "Track taps, clicks, location coordinates, and device types in real-time." }
];

export function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.35], [1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 0.35], [1, 0.65]);

  return (
    <main className="min-h-screen bg-[#050608] text-white selection:bg-signal selection:text-ink overflow-x-hidden">
      {/* Full-Viewport Neon Light Frame */}
      <div className="neon-frame" />

      {/* Decorative Orbs */}
      <div className="glowing-orb top-[-10%] left-[20%] w-[500px] h-[500px] bg-signal/20" />
      <div className="glowing-orb top-[40%] right-[10%] w-[600px] h-[600px] bg-purple-500/10" />
      <div className="glowing-orb bottom-[-5%] left-[5%] w-[450px] h-[450px] bg-emerald-500/10" />

      {/* Hero Presentation Header */}
      <section className="noise relative min-h-screen overflow-hidden flex flex-col justify-between">
        <IdentityScene />
        <div className="app-grid absolute inset-0 opacity-40 pointer-events-none" />
        
        {/* Navigation Bar */}
        <nav className="absolute left-0 right-0 top-0 z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-8">
          <a href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md group-hover:border-signal/40 transition duration-300">
              <img src="/assets/tapyfi-mark.svg" alt="" className="h-6 w-6 object-contain" />
            </div>
            <span className="text-base font-bold uppercase tracking-wider text-white group-hover:text-signal transition duration-300">tapyfi</span>
          </a>
          <div className="hidden items-center gap-8 rounded-full border border-white/5 bg-white/[0.03] px-6 py-3 text-sm text-white/70 backdrop-blur-xl md:flex shadow-2xl">
            <a href="#platform" className="hover:text-signal transition">Platform</a>
            <a href="#nfc" className="hover:text-signal transition">NFC</a>
            <a href="#commerce" className="hover:text-signal transition">Marketplace</a>
            <a href="#architecture" className="hover:text-signal transition">Architecture</a>
          </div>
          <MagneticButton to="/login" variant="secondary" className="hidden md:inline-flex shadow-lg shadow-black/40">
            Sign in
          </MagneticButton>
        </nav>

        {/* Hero Copy Block */}
        <motion.div
          style={{ scale, opacity }}
          className="relative z-10 mx-auto flex flex-col justify-end w-full max-w-7xl px-6 pb-12 pt-32 md:px-8 md:pb-16 flex-grow"
        >
          <div className="max-w-4xl mt-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-signal/20 bg-signal/5 px-4 py-1.5 text-xs font-semibold text-signal backdrop-blur-xl"
            >
              <Sparkles size={12} className="animate-pulse" />
              <span>Identity OS — Version 1.0 Live</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-display text-[clamp(4.5rem,15vw,11.5rem)] leading-[0.82] tracking-tight text-white"
            >
              The presence<br/>
              <span className="text-white/40">layer for</span> founders.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl"
            >
              A premium, next-generation NFC digital identity ecosystem. Program your visual card online, rewrite dynamic redirects, and update signatures instantly without modifying the physical chip.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <MagneticButton to="/dashboard" className="shadow-lg shadow-signal/15">
                Launch Dashboard
                <ArrowRight size={16} />
              </MagneticButton>
              <MagneticButton to="/profile/faraz" variant="secondary" className="border-white/10 hover:border-white/20">
                View Demo Profile
              </MagneticButton>
            </motion.div>
          </div>

          {/* Lower Stats Row */}
          <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-white/10 pt-8">
            {[
              ["Visual Identity", "Instant Cloud Sync", "accent"],
              ["NFC card support", "Type 2 & 4 Programable", "secondaryAccent"],
              ["Dynamic QR Engine", "SVG & Vector Formats", "signal"],
              ["Scan Analytics", "Real-time Telemetry", "leaf"]
            ].map(([label, value, dotColor], index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.08 }}
                className="group relative rounded-[16px] border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/10 transition duration-300"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: `var(--color-${dotColor}, #6fffe9)` }} />
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40">{label}</p>
                </div>
                <p className="text-base font-bold text-white group-hover:text-signal transition duration-300">{value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Modules Grid Section */}
      <section id="platform" className="relative border-y border-white/10 bg-[#080a0d]/60 px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl z-10 relative">
          <div className="max-w-3xl mb-16">
            <p className="text-xs uppercase tracking-widest text-signal font-extrabold">Unified Presence Layer</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              Not a business card.<br/>
              A <span className="font-display italic text-gradient-purple">live identity operating system</span>.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                <div className="glow-card-hover h-full rounded-[24px] p-8 flex flex-col justify-between group">
                  <div>
                    <div 
                      className="mb-8 h-12 w-12 rounded-[16px] flex items-center justify-center text-white"
                      style={{ background: `linear-gradient(135deg, ${module.color}15, ${module.color}25)`, border: `1px solid ${module.color}30` }}
                    >
                      <module.icon size={22} style={{ color: module.color }} />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/5 text-white/50">{module.badge}</span>
                    <h3 className="text-xl font-bold text-white mt-4 group-hover:text-signal transition duration-300">{module.title}</h3>
                    <p className="mt-3.5 text-sm leading-relaxed text-white/60">{module.copy}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-white/40 group-hover:text-signal transition duration-300">
                    <span>Learn module</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition duration-200" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NFC Workflow Section */}
      <section id="nfc" className="px-6 py-24 md:px-8 relative">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-signal font-extrabold">NFC-First Infrastructure</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl leading-[1.1]">
              The chip stores the URL.<br/>
              The platform does the thinking.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-white/70">
              Profiles sync dynamically, so every physical card, custom tag, sticker, dynamic QR code, and signature stays current. Update your contact cards, colors, links, and direct redirects without ever rewriting details onto the physical chip.
            </p>
          </div>
          <div className="grid gap-4">
            {story.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="flex items-start gap-5 rounded-[20px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-5 hover:border-white/10 transition duration-300 group"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-white/5 border border-white/10 text-base font-bold text-signal group-hover:bg-signal group-hover:text-ink transition duration-300">
                  {index + 1}
                </span>
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-signal transition duration-300">{item.title}</h4>
                  <p className="mt-1.5 text-sm text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Luxury Commerce Marketplace */}
      <section id="commerce" className="bg-[#0b0907]/60 border-t border-white/5 px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end mb-16">
            <div>
              <p className="text-xs uppercase tracking-widest text-signal font-extrabold">Custom Identity Products</p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">
                Dynamic cards,<br/>
                ordered inside the OS.
              </h2>
            </div>
            <p className="text-base leading-relaxed text-white/70">
              Purchase physical matte black PVC, titanium executive metal, or eco-friendly wood NFC products configured with a live visualizer, dynamic URL locks, custom QR overlays, and checkout systems.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Matte Obsidian Card", gradient: "from-black via-zinc-800 to-zinc-950", price: "₹1,999", border: "border-white/10" },
              { name: "Titanium Executive Card", gradient: "from-zinc-900 via-zinc-700 to-zinc-950", price: "₹3,499", border: "border-signal/20" },
              { name: "Bamboo Desktop Block", gradient: "from-amber-950 via-yellow-900 to-amber-950", price: "₹2,799", border: "border-white/10" }
            ].map((prod, index) => (
              <GlassCard key={prod.name} className={`p-5 group hover:-translate-y-2 transition-transform duration-300 border ${prod.border}`}>
                {/* Visual Card preview */}
                <div className={`h-52 rounded-[16px] bg-gradient-to-br ${prod.gradient} relative overflow-hidden flex flex-col justify-between p-6 shadow-2xl border border-white/10`}>
                  <div className="flex justify-between items-start">
                    <img src="/assets/tapyfi-mark.svg" alt="" className="h-7 w-7 opacity-80" />
                    <ScanLine size={20} className="text-white/40 group-hover:text-signal transition" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-white/40">Identity Card</p>
                    <p className="text-sm font-semibold tracking-wide text-white/90 mt-1">Faraz Khan</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-signal transition">{prod.name}</h4>
                    <p className="text-xs text-white/40 mt-1">Matte Finish · NTAG213</p>
                  </div>
                  <span className="text-sm font-bold text-signal bg-signal/15 px-3 py-1 rounded-[6px] border border-signal/20">{prod.price}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Blueprint Architecture Section */}
      <section id="architecture" className="px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <GlassCard className="p-8 md:p-12 border border-white/5 relative overflow-hidden">
            <div className="glowing-orb bottom-[-20%] right-[-10%] w-[300px] h-[300px] bg-signal/10" />
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1fr] relative z-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-signal font-extrabold">Developer Blueprint</p>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl leading-tight">
                  Scalable React & Node framework.
                </h2>
                <p className="mt-5 text-sm md:text-base text-white/60 leading-relaxed">
                  tapyfi is structured cleanly for local prototyping and rapid production deployment. Includes full database migrations, JWT session validation, Web NFC modules, dynamic QR generators, and PWA capabilities.
                </p>
                <div className="mt-8">
                  <MagneticButton to="/dashboard" variant="secondary" className="border-white/10 hover:border-white/20">
                    Explore code panel
                  </MagneticButton>
                </div>
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                {(() => {
                  const blueprintItems: [any, string, string][] = [
                    [Layers3, "React + TypeScript + Vite", "Modular structure"],
                    [Zap, "Framer Motion micro-effects", "Liquid interactions"],
                    [ShieldCheck, "Bcrypt + JWT authorization", "Secure endpoints"],
                    [BarChart3, "Dynamic scanning aggregates", "Scan telemetry"],
                    [BadgeCheck, "Prisma database constraints", "Relational database"],
                    [QrCode, "Branded QR code generator", "Vector downloads"]
                  ];
                  return blueprintItems.map(([Icon, label, desc]) => (
                    <div key={label} className="flex gap-4 rounded-[16px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] p-5 hover:border-white/10 transition duration-300">
                      <div className="h-10 w-10 shrink-0 rounded-[12px] bg-white/5 border border-white/5 flex items-center justify-center text-signal">
                        <Icon size={18} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white block">{label}</span>
                        <span className="text-xs text-white/40 mt-1 block">{desc}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#050608]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-3">
            <img src="/assets/tapyfi-mark.svg" alt="" className="h-7 w-7 rounded-[6px]" />
            <span className="text-sm font-bold uppercase tracking-wider text-white">tapyfi</span>
          </a>
          <p className="text-xs text-white/35">© 2026 tapyfi. All rights reserved. Identity operating system prototype.</p>
          <div className="flex gap-6 text-xs text-white/40">
            <a href="/login" className="hover:text-signal transition">Dashboard</a>
            <a href="/profile/faraz" className="hover:text-signal transition">Demo Profile</a>
            <a href="/shop" className="hover:text-signal transition">Marketplace</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
