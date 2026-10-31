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
    const campaignPresets: CampaignPreset[] = raw ? JSON.parse(raw) : [];

    // "presets should not transfer over to campain mode unless it is just like campain mode."
    // A test mode preset qualifies as "just like campaign mode" ONLY if:
    // 1. It has between 1 and 5 stuffies
    // 2. EVERY stuffy has a valid speciesId and a valid selectedLoadoutId
    const rawTest = localStorage.getItem('ben_stuffy_test_presets_v1');
    const testPresets = rawTest ? JSON.parse(rawTest) : [];
    const validTransfers: CampaignPreset[] = [];

    if (Array.isArray(testPresets)) {
      for (const tp of testPresets) {
        if (
          Array.isArray(tp.team) &&
          tp.team.length > 0 &&
          tp.team.length <= 5 &&
          tp.team.every(
            (s: any) =>
              typeof s.speciesId === 'string' &&
              typeof s.selectedLoadoutId === 'string' &&
              s.selectedLoadoutId.trim().length > 0
          )
        ) {
          validTransfers.push({
            id: `test_transfer_${tp.savedAt || tp.name}`,
            name: `${tp.name} (from Test Mode)`,
            description: `Squad with ${tp.team.length} stuffies transferred from Test Mode.`,
            icon: '🧪',
            squad: tp.team.map((s: any) => ({
              speciesId: s.speciesId,
              loadoutId: s.selectedLoadoutId,
            })),
            isCustom: true,
          });
        }
      }
    }

    return [...campaignPresets, ...validTransfers];
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
