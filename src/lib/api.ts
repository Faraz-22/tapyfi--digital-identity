import type { Profile, NfcProduct } from "../types";

export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = typeof window === "undefined" ? "localhost" : window.location.hostname;
  return `http://${hostname}:4000`;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  
  const token = typeof window !== "undefined" ? window.localStorage.getItem("tapyfi.auth.token") : null;
  const isFormData = init?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> || {})
  };

  const response = await fetch(`${base}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const text = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Not JSON
    }
    throw new Error(parsed?.error || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: any }> {
  return apiRequest<{ token: string; user: any }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function getProfile(slug: string): Promise<Profile> {
  try {
    const profile = await apiRequest<Profile>(`/api/profiles/${slug}`);
    if (profile && typeof window !== "undefined") {
      window.localStorage.setItem(`tapyfi.profile.cache.${slug}`, JSON.stringify(profile));
    }
    return profile;
  } catch (error) {
    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem(`tapyfi.profile.cache.${slug}`);
      if (cached) {
        try {
          return JSON.parse(cached) as Profile;
        } catch {
          // Ignore parse errors
        }
      }
    }
    throw error;
  }
}

export async function updateProfile(slug: string, profile: Profile): Promise<Profile> {
  return apiRequest<Profile>(`/api/profiles/${slug}`, {
    method: "PUT",
    body: JSON.stringify(profile)
  });
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("image", file);
  return apiRequest<{ url: string }>("/api/upload", {
    method: "POST",
    body: formData
  });
}

export interface AnalyticsSummary {
  profileId: string;
  taps: number;
  scans: number;
  clicks: number;
  views: number;
  totalEvents: number;
  devices: Record<string, number>;
  topCities: string[];
}

export async function getAnalyticsSummary(profileId: string): Promise<AnalyticsSummary> {
  return apiRequest<AnalyticsSummary>(`/api/analytics/profiles/${profileId}/summary`);
}

export interface BioGeneratorResult {
  tone: string;
  role: string;
  options: string[];
}

export async function generateBio(params: {
  role: string;
  skills: string;
  tone: string;
  company?: string;
  name?: string;
}): Promise<BioGeneratorResult> {
  return apiRequest<BioGeneratorResult>("/api/ai/bio", {
    method: "POST",
    body: JSON.stringify(params)
  });
}

export async function getMyProfile(): Promise<Profile> {
  try {
    const profile = await apiRequest<Profile>("/api/profiles/mine");
    if (profile && typeof window !== "undefined") {
      window.localStorage.setItem(`tapyfi.profile.cache.${profile.slug}`, JSON.stringify(profile));
    }
    return profile;
  } catch (error) {
    if (typeof window !== "undefined") {
      // Fallback to searching all profile caches if offline
      const keys = Object.keys(window.localStorage);
      const cacheKey = keys.find(k => k.startsWith("tapyfi.profile.cache."));
      if (cacheKey) {
        const cached = window.localStorage.getItem(cacheKey);
        if (cached) {
          try {
            return JSON.parse(cached) as Profile;
          } catch {}
        }
      }
    }
    throw error;
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<{ token: string; user: any }> {
  return apiRequest<{ token: string; user: any }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });
}

export async function loginWithGoogle(credential: string): Promise<{ token: string; user: any }> {
  return apiRequest<{ token: string; user: any }>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential })
  });
}

export async function getMyNfcProducts(): Promise<NfcProduct[]> {
  return apiRequest<NfcProduct[]>("/api/nfc/mine");
}

export async function assignNfcProduct(profileId: string, productId: string, active = true): Promise<NfcProduct> {
  return apiRequest<NfcProduct>("/api/nfc/assign", {
    method: "POST",
    body: JSON.stringify({ profileId, productId, active })
  });
}

export async function toggleNfcStatus(id: string, active: boolean): Promise<NfcProduct> {
  return apiRequest<NfcProduct>(`/api/nfc/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active })
  });
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword })
  });
}

