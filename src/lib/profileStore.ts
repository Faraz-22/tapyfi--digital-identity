import { baseProfile } from "../data/mock";
import type { Profile } from "../types";

const PROFILE_STORE_KEY = "tapyfi.profiles.v1";
const ACTIVE_PROFILE_KEY = "tapyfi.activeProfileId";
const PROFILE_EVENT = "tapyfi-profile-updated";

type ProfileMap = Record<string, Profile>;

function canStore() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readMap(): ProfileMap {
  if (!canStore()) return { [baseProfile.id]: baseProfile };

  const raw = window.localStorage.getItem(PROFILE_STORE_KEY);
  if (!raw) {
    const seeded = { [baseProfile.id]: baseProfile };
    window.localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(seeded));
    window.localStorage.setItem(ACTIVE_PROFILE_KEY, baseProfile.id);
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as ProfileMap;
    return Object.keys(parsed).length ? parsed : { [baseProfile.id]: baseProfile };
  } catch {
    return { [baseProfile.id]: baseProfile };
  }
}

function writeMap(map: ProfileMap) {
  if (canStore()) {
    try {
      window.localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(map));
    } catch (error) {
      // localStorage quota exceeded — likely due to large images.
      // Try to save a version without base64 image data as a last resort.
      console.warn("localStorage quota exceeded, attempting to save without images:", error);
      const stripped: ProfileMap = {};
      for (const [id, profile] of Object.entries(map)) {
        stripped[id] = {
          ...profile,
          avatar: profile.avatar.startsWith("data:") ? baseProfile.avatar : profile.avatar,
          cover: profile.cover.startsWith("data:") ? baseProfile.cover : profile.cover
        };
      }
      try {
        window.localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(stripped));
      } catch {
        console.error("Failed to save profile even without images.");
      }
    }
  }
}

export function getAllProfiles() {
  return Object.values(readMap());
}

export function getActiveProfile() {
  const map = readMap();
  const activeId = canStore() ? window.localStorage.getItem(ACTIVE_PROFILE_KEY) : baseProfile.id;
  return map[activeId || baseProfile.id] || Object.values(map)[0] || baseProfile;
}

export function getProfileById(id?: string) {
  if (!id) return undefined;
  return readMap()[id];
}

export function getProfileBySlug(slug?: string) {
  if (!slug) return undefined;
  const lower = slug.toLowerCase();
  return getAllProfiles().find((profile) => profile.slug.toLowerCase() === lower);
}

export function ensureUniqueSlug(profile: Profile) {
  // Use the slug as-is (it should already be normalized by the UI via toSlug)
  const slug = profile.slug || profile.id;
  const profiles = getAllProfiles().filter((candidate) => candidate.id !== profile.id);
  const taken = new Set(profiles.map((candidate) => candidate.slug.toLowerCase()));

  if (!taken.has(slug.toLowerCase())) return slug;

  let suffix = 2;
  while (taken.has(`${slug}-${suffix}`.toLowerCase())) suffix += 1;
  return `${slug}-${suffix}`;
}

export function saveProfile(profile: Profile) {
  const map = readMap();
  const uniqueSlug = ensureUniqueSlug(profile);
  const saved: Profile = {
    ...profile,
    slug: uniqueSlug,
    links: profile.links.map((link, index) => ({ ...link, id: link.id || `link_${index}_${Date.now()}` }))
  };

  map[saved.id] = saved;
  writeMap(map);

  if (canStore()) {
    window.localStorage.setItem(ACTIVE_PROFILE_KEY, saved.id);
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: saved }));
  }

  return saved;
}

export function subscribeToProfileChanges(callback: () => void) {
  if (!canStore()) return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === PROFILE_STORE_KEY || event.key === ACTIVE_PROFILE_KEY) callback();
  };
  const onProfile = () => callback();

  window.addEventListener("storage", onStorage);
  window.addEventListener(PROFILE_EVENT, onProfile);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PROFILE_EVENT, onProfile);
  };
}

/**
 * Compress an image file to a reasonable size for localStorage storage.
 * Returns a base64 data URL.
 * Target: ~300KB max to avoid hitting localStorage's ~5MB quota with multiple images.
 */
export function compressAndConvertImage(file: File, maxWidth = 1200, maxHeight = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload a valid image file."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Scale down if necessary
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Try progressively lower quality to stay under ~300KB
        const maxBytes = 300_000;
        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/webp", quality);

        while (dataUrl.length > maxBytes && quality > 0.15) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/webp", quality);
        }

        // If still too large, scale down dimensions
        if (dataUrl.length > maxBytes) {
          const scale = Math.sqrt(maxBytes / dataUrl.length) * 0.9;
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL("image/webp", 0.6);
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Unable to read this image."));
    reader.readAsDataURL(file);
  });
}

/** @deprecated Use compressAndConvertImage instead for localStorage safety. */
export function imageFileToDataUrl(file: File) {
  return compressAndConvertImage(file);
}
