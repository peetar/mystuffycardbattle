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

export const BUILTIN_CAMPAIGN_PRESETS: CampaignPreset[] = [
  {
    id: 'preset_original_classics',
    name: 'Original Classics',
    description: 'The iconic vanguard: balanced high-tempo strikes, tactical shields, lifesteal, and sacrifice healing.',
    icon: '⭐',
    squad: [
      { speciesId: 'alex', loadoutId: 'alex_pkg_1' },
      { speciesId: 'jefe', loadoutId: 'jefe_pkg_1' },
      { speciesId: 'finlee', loadoutId: 'finlee_pkg_1' },
      { speciesId: 'slugmee', loadoutId: 'slugmee_pkg_2' },
      { speciesId: 'fifi', loadoutId: 'fifi_pkg_1' },
    ],
  },
  {
    id: 'preset_toxin_syndicate',
    name: 'Toxin & Control Syndicate',
    description: 'Deadly DoT synergy: bleeding stuffing, neighbor poison spread, death roll lifesteal, and hypnosis control.',
    icon: '🧪',
    squad: [
      { speciesId: 'spike', loadoutId: 'spike_pkg_1' },
      { speciesId: 'allie', loadoutId: 'allie_pkg_1' },
      { speciesId: 'umbreon', loadoutId: 'umbreon_pkg_2' },
      { speciesId: 'spot', loadoutId: 'spot_pkg_3' },
      { speciesId: 'chanteira', loadoutId: 'chanteira_pkg_1' },
    ],
  },
  {
    id: 'preset_colossal_tanks',
    name: 'Colossal Tanks & Slumber',
    description: 'Impenetrable fluff defense: Big Bear hibernation shields, Pinky candy weakness, and carrot bulwarks.',
    icon: '🛡️',
    squad: [
      { speciesId: 'big_bear', loadoutId: 'big_bear_pkg_2' },
      { speciesId: 'pinky_bear', loadoutId: 'pinky_bear_pkg_2' },
      { speciesId: 'thumper', loadoutId: 'thumper_pkg_2' },
      { speciesId: 'jefe', loadoutId: 'jefe_pkg_2' },
      { speciesId: 'alex', loadoutId: 'alex_pkg_2' },
    ],
  },
  {
    id: 'preset_mystic_elements',
    name: 'Mystic Elements & Speed',
    description: 'Chaotic celestial power: Shadow inhibitor releases, George emotional shifts, and reality glitches.',
    icon: '✨',
    squad: [
      { speciesId: 'shadow', loadoutId: 'shadow_pkg_1' },
      { speciesId: 'george', loadoutId: 'george_pkg_3' },
      { speciesId: 'dolphy', loadoutId: 'dolphy_pkg_2' },
      { speciesId: 'eevee', loadoutId: 'eevee_pkg_3' },
      { speciesId: 'whiskers', loadoutId: 'whiskers_pkg_1' },
    ],
  },
  {
    id: 'preset_bleed_predators',
    name: 'Lifesteal & Bleed Hunters',
    description: 'Aggressive predatory strike squad inflicting bleed and reaping 50% bonus health with Allie and Finlee.',
    icon: '🐊',
    squad: [
      { speciesId: 'allie', loadoutId: 'allie_pkg_1' },
      { speciesId: 'finlee', loadoutId: 'finlee_pkg_1' },
      { speciesId: 'spike', loadoutId: 'spike_pkg_1' },
      { speciesId: 'snuggles', loadoutId: 'snuggles_pkg_1' },
      { speciesId: 'barnaby', loadoutId: 'barnaby_pkg_1' },
    ],
  },
];

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
