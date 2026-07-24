import type { AnalyticsDatum, Product, Profile } from "../types";

export const baseProfile: Profile = {
  id: "prof_faraz",
  name: "Faraz Khan",
  slug: "faraz",
  title: "Founder & Product Architect",
  company: "tapyfi",
  bio: "Building elegant identity infrastructure for founders, creators, teams, and premium brands. Tap once, update forever.",
  location: "Mumbai, India",
  website: "https://tapyfi.com",
  phones: ["+91 98765 43210"],
  emails: ["hello@tapyfi.com", "faraz@tapyfi.com"],
  avatar:
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=480&q=80",
  cover:
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80",
  logo: "/assets/tapyfi-mark.svg",
  accent: "#6fffe9",
  secondaryAccent: "#f8c66d",
  theme: "midnight",
  layout: "halo",
  bgStyle: "iridescence",
  bgConfig: '{"red":0.60,"green":0.55,"blue":0.73,"speed":4.0,"intensity":1.9,"mouse":true}',
  ctas: [
    { id: "cta_1", label: "Book a strategy call", href: "https://cal.com", style: "primary" },
    { id: "cta_2", label: "Save contact", href: "mailto:hello@tapyfi.com", style: "secondary" }
  ],
  links: [
    {
      id: "link_1",
      platform: "LinkedIn",
      label: "LinkedIn",
      url: "https://linkedin.com",
      clicks: 1284,
      enabled: true
    },
    {
      id: "link_2",
      platform: "Instagram",
      label: "Instagram",
      url: "https://instagram.com",
      clicks: 936,
      enabled: true
    },
    {
      id: "link_3",
      platform: "GitHub",
      label: "GitHub",
      url: "https://github.com",
      clicks: 612,
      enabled: true
    },
    {
      id: "link_4",
      platform: "WhatsApp",
      label: "WhatsApp",
      url: "https://wa.me/919876543210",
      clicks: 492,
      enabled: true
    }
  ]
};

export const analytics: AnalyticsDatum[] = [
  { label: "Mon", taps: 72, scans: 44, clicks: 118 },
  { label: "Tue", taps: 96, scans: 52, clicks: 139 },
  { label: "Wed", taps: 131, scans: 74, clicks: 188 },
  { label: "Thu", taps: 155, scans: 88, clicks: 214 },
  { label: "Fri", taps: 188, scans: 96, clicks: 271 },
  { label: "Sat", taps: 164, scans: 108, clicks: 249 },
  { label: "Sun", taps: 119, scans: 82, clicks: 181 }
];

export const products: Product[] = [
  {
    id: "card_black",
    name: "Matte Black NFC Card",
    category: "PVC",
    finish: "Soft-touch matte",
    price: 2499,
    inventory: 118,
    color: "#0b0d10",
    imageTone: "from-zinc-950 via-zinc-800 to-slate-500",
    features: ["Dynamic URL", "Printed QR", "Scratch-resistant"]
  },
  {
    id: "card_metal",
    name: "Titanium Edge Card",
    category: "Metal",
    finish: "Brushed metal",
    price: 8499,
    inventory: 32,
    color: "#a8adb3",
    imageTone: "from-neutral-100 via-zinc-400 to-zinc-900",
    features: ["Laser etched", "Luxury weight", "NFC shield layer"]
  },
  {
    id: "card_wood",
    name: "Walnut NFC Card",
    category: "Wood",
    finish: "Natural grain",
    price: 4999,
    inventory: 44,
    color: "#8b5a2b",
    imageTone: "from-amber-900 via-yellow-700 to-stone-300",
    features: ["Eco finish", "Engraved logo", "Custom edge stain"]
  },
  {
    id: "sticker_luxe",
    name: "NFC Luxe Sticker Pack",
    category: "Sticker",
    finish: "Pearl vinyl",
    price: 1299,
    inventory: 240,
    color: "#fbf5dd",
    imageTone: "from-rose-100 via-amber-100 to-cyan-200",
    features: ["5-pack", "Weatherproof", "QR optional"]
  },
  {
    id: "keychain_onyx",
    name: "Onyx NFC Keychain",
    category: "Keychain",
    finish: "Anodized alloy",
    price: 3499,
    inventory: 72,
    color: "#111111",
    imageTone: "from-black via-stone-700 to-amber-200",
    features: ["Tap-ready", "Laser logo", "Team friendly"]
  },
  {
    id: "desk_plate",
    name: "Executive Desk Plate",
    category: "Desk",
    finish: "Graphite glass",
    price: 6999,
    inventory: 26,
    color: "#151b20",
    imageTone: "from-slate-900 via-teal-500 to-yellow-200",
    features: ["Reception mode", "Review links", "Venue-ready"]
  }
];
