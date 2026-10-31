export interface PresetStuffySelection {
  speciesId: string;
  loadoutId: string;
}

export interface CampaignPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  squad: PresetStuffySelection[];
  isCustom?: boolean;
}

export const BUILTIN_CAMPAIGN_PRESETS: CampaignPreset[] = [];

const CUSTOM_PRESETS_STORAGE_KEY = 'ben_stuffy_custom_campaign_presets_v1';

export function getCustomCampaignPresets(): CampaignPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomCampaignPreset(preset: CampaignPreset): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCustomCampaignPresets().filter((p) => p.id !== preset.id);
    current.unshift({ ...preset, isCustom: true });
    localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function deleteCustomCampaignPreset(presetId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCustomCampaignPresets().filter((p) => p.id !== presetId);
    localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function getAllCampaignPresets(): CampaignPreset[] {
  const custom = getCustomCampaignPresets();
  return [...BUILTIN_CAMPAIGN_PRESETS, ...custom];
}
