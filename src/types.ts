export type ThemeMode = "midnight" | "champagne" | "daylight";
export type ProfileLayout = "halo" | "editorial" | "stack";

export type SocialPlatform =
  | "Instagram"
  | "LinkedIn"
  | "GitHub"
  | "WhatsApp"
  | "Telegram"
  | "X"
  | "YouTube"
  | "Behance"
  | "Dribbble"
  | "Discord"
  | "Spotify"
  | "Snapchat"
  | "Pinterest"
  | "Facebook"
  | "TikTok"
  | "Twitch"
  | "Medium"
  | "Substack"
  | "Figma"
  | "Calendly"
  | "Website"
  | "Custom";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  clicks: number;
  enabled: boolean;
}

export interface CtaButton {
  id: string;
  label: string;
  href: string;
  style: "primary" | "secondary";
}

export interface Profile {
  id: string;
  name: string;
  slug: string;
  title: string;
  company: string;
  bio: string;
  location: string;
  website: string;
  phones: string[];
  emails: string[];
  avatar: string;
  cover: string;
  logo: string;
  accent: string;
  secondaryAccent: string;
  theme: ThemeMode;
  layout: ProfileLayout;
  bgStyle: string;
  bgConfig: string;
  directRedirectUrl?: string | null;
  ctas: CtaButton[];
  links: SocialLink[];
  viewsCount?: number;
}

export interface AnalyticsDatum {
  label: string;
  taps: number;
  scans: number;
  clicks: number;
}

export interface Product {
  id: string;
  name: string;
  category: "PVC" | "Metal" | "Wood" | "Sticker" | "Keychain" | "Desk" | "Band";
  finish: string;
  price: number;
  inventory: number;
  color: string;
  imageTone: string;
  features: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  personalization: {
    name: string;
    title: string;
    color: string;
    includeQr: boolean;
  };
}

export interface NfcProduct {
  id: string;
  teamId?: string | null;
  profileId?: string | null;
  productSku: string;
  chipUid?: string | null;
  active: boolean;
  programmedUrl?: string | null;
  assignedAt?: string | null;
  profile?: { name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
}
