import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink, GripVertical, Plus, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { Profile, SocialLink, SocialPlatform } from "../types";
import { GlassCard } from "./GlassCard";
import { MagneticButton } from "./MagneticButton";
import { BrandIcon, getBrandStyle } from "./BrandIcon";

const platforms: SocialPlatform[] = [
  "Instagram",
  "LinkedIn",
  "GitHub",
  "WhatsApp",
  "Telegram",
  "X",
  "YouTube",
  "Spotify",
  "Discord",
  "Snapchat",
  "Pinterest",
  "Facebook",
  "TikTok",
  "Twitch",
  "Medium",
  "Substack",
  "Figma",
  "Calendly",
  "Website",
  "Custom"
];

export function LinkManager({ profile, setProfile }: { profile: Profile; setProfile: Dispatch<SetStateAction<Profile>> }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function updateLink(id: string, patch: Partial<SocialLink>) {
    setProfile((current) => ({
      ...current,
      links: current.links.map((link) => (link.id === id ? { ...link, ...patch } : link))
    }));
  }

  function removeLink(id: string) {
    setProfile((current) => ({
      ...current,
      links: current.links.filter((link) => link.id !== id)
    }));
  }

  function addLink(platform: SocialPlatform = "Custom") {
    const brand = getBrandStyle(platform);
    const next: SocialLink = {
      id: `link_${Date.now()}`,
      platform,
      label: platform === "Custom" ? "New link" : platform,
      url: brand.prefix,
      clicks: 0,
      enabled: true
    };
    setProfile((current) => ({ ...current, links: [...current.links, next] }));
  }

  // Handle reordering links
  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setProfile((current) => {
      const oldIndex = current.links.findIndex((link) => link.id === active.id);
      const newIndex = current.links.findIndex((link) => link.id === over.id);
      return { ...current, links: arrayMove(current.links, oldIndex, newIndex) };
    });
  }

  return (
    <div className="grid gap-6">
      {/* Interactive Quick Add Catalog */}
      <GlassCard className="p-5 border-white/10">
        <p className="text-xs font-semibold uppercase text-signal">Catalog</p>
        <h3 className="mt-1 text-lg font-bold text-white">Quick-add platforms</h3>
        <p className="text-xs text-white/50 mb-4">Click any platform to instantly append it to your live identity.</p>
        
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10">
          {platforms.map((platform) => {
            const brand = getBrandStyle(platform);
            if (platform === "Custom") return null;
            return (
              <button
                key={platform}
                type="button"
                onClick={() => addLink(platform)}
                className="premium-focus group flex flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-center transition hover:bg-white/[0.08] hover:border-white/15 hover:scale-[1.04]"
                title={`Add ${platform}`}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition group-hover:scale-110"
                  style={{ background: brand.bg }}
                >
                  <BrandIcon platform={platform} className="h-4 w-4" />
                </span>
                <span className="text-[10px] text-white/60 truncate w-full group-hover:text-white transition">
                  {platform}
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Main active links list */}
      <GlassCard className="p-5 border-white/10">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase text-white/45 font-semibold">Active links</p>
            <h3 className="text-xl font-bold text-white">Drag to reorder your profile links</h3>
          </div>
          <MagneticButton variant="secondary" onClick={() => addLink("Custom")}>
            <Plus size={16} />
            Add custom link
          </MagneticButton>
        </div>

        {profile.links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-white/30 mb-3">
              <Plus size={24} />
            </div>
            <p className="text-sm text-white/50 font-medium">No links added to your profile yet.</p>
            <p className="text-xs text-white/35 mt-1">Use the catalog above or add a custom link to get started.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={profile.links.map((link) => link.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-4">
                {profile.links.map((link) => (
                  <SortableLinkRow
                    key={link.id}
                    link={link}
                    onUpdate={(patch) => updateLink(link.id, patch)}
                    onRemove={() => removeLink(link.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </GlassCard>
    </div>
  );
}

function SortableLinkRow({
  link,
  onUpdate,
  onRemove
}: {
  link: SocialLink;
  onUpdate: (patch: Partial<SocialLink>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const brand = getBrandStyle(link.platform);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 1
      }}
      className={`group relative grid gap-4 rounded-xl border p-4 bg-white/[0.02] border-white/10 transition-all hover:bg-white/[0.04] hover:border-white/15 xl:grid-cols-[auto_1fr_auto] xl:items-center`}
    >
      {/* Left: Drag Handle and Platform Identity */}
      <div className="flex items-center gap-3">
        <button
          aria-label={`Reorder ${link.label}`}
          className="premium-focus cursor-grab active:cursor-grabbing rounded-[6px] p-1.5 text-white/30 hover:text-white/70 hover:bg-white/5 transition"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>

        {/* Brand Icon Block */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-glow transition group-hover:scale-105"
          style={{ background: brand.bg }}
        >
          <BrandIcon platform={link.platform} className="h-5 w-5" />
        </div>

        {/* Info */}
        <div className="grid min-w-0">
          <span className="text-xs uppercase text-white/40 font-semibold tracking-wider">{link.platform}</span>
          <span className="text-sm font-semibold text-white truncate">{link.label || "Untitled"}</span>
        </div>
      </div>

      {/* Middle: Input Fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-xs text-white/50">
          Link Label
          <input
            aria-label="Link label"
            className="premium-focus rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white transition hover:bg-white/[0.07] focus:bg-ink"
            value={link.label}
            placeholder={link.platform}
            onChange={(event) => onUpdate({ label: event.target.value })}
          />
        </label>
        
        <label className="grid gap-1.5 text-xs text-white/50">
          Username / URL
          <div className="relative flex items-center">
            {/* Show dynamic prefix in input */}
            {brand.prefix && brand.prefix !== "https://" && (
              <span className="pointer-events-none absolute left-3 text-xs text-white/30 truncate max-w-[140px] hidden sm:inline">
                {brand.prefix.replace("https://", "")}
              </span>
            )}
            <input
              aria-label="Link URL"
              className={`premium-focus w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pr-9 text-sm text-white transition hover:bg-white/[0.07] focus:bg-ink ${
                brand.prefix && brand.prefix !== "https://" ? "sm:pl-[145px] pl-3" : "pl-3"
              }`}
              value={link.url}
              placeholder={brand.placeholder}
              onChange={(event) => onUpdate({ url: event.target.value })}
            />
            {/* Test Link Button */}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-2.5 rounded-md p-1 text-white/30 hover:text-signal hover:bg-white/5 transition"
              title="Test link in new tab"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </label>
      </div>

      {/* Right: Controls (Switch, Clicks, Remove) */}
      <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-3 xl:border-t-0 xl:pt-0">
        {/* Click stats badge */}
        {link.clicks > 0 ? (
          <div className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-white/70 border border-white/5" title="Total clicks tracked">
            {link.clicks.toLocaleString()} clicks
          </div>
        ) : (
          <div className="rounded-full bg-white/[0.02] px-2.5 py-1 text-[10px] text-white/30 border border-white/5">
            0 clicks
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Live Status Switch */}
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={link.enabled}
              onChange={(event) => onUpdate({ enabled: event.target.checked })}
            />
            <div className="peer h-5 w-9 rounded-full bg-white/10 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white/60 after:transition-all peer-checked:bg-signal peer-checked:after:translate-x-full peer-checked:after:bg-ink"></div>
            <span className="ml-2 text-xs font-medium text-white/60 peer-checked:text-signal select-none">Live</span>
          </label>

          {/* Delete Button */}
          <button
            aria-label={`Remove ${link.label}`}
            className="premium-focus rounded-lg border border-white/5 bg-white/[0.04] p-2 text-white/40 hover:text-pulse hover:bg-pulse/10 hover:border-pulse/25 transition-all"
            onClick={onRemove}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
