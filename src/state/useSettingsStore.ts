import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const KEY = 'waarbenje.settings';

interface Settings {
  // Meteen je locatie delen als je de kaart opent.
  autoShare: boolean;
  // Je scherm laten aanstaan zolang de kaart open is (handig tijdens het zoeken).
  keepAwake: boolean;
  // Radar (plattegrond rond jou) of echte kaart (OpenStreetMap).
  mapView: 'radar' | 'map';
}

interface SettingsState extends Settings {
  load: () => Promise<void>;
  update: (changes: Partial<Settings>) => void;
}

const defaults: Settings = { autoShare: true, keepAwake: true, mapView: 'radar' };

// Instellingen bewaren we alleen op dit toestel.
export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaults,
  load: async () => {
    try {
      const saved = await AsyncStorage.getItem(KEY);
      if (saved !== null) set({ ...defaults, ...(JSON.parse(saved) as Partial<Settings>) });
    } catch {
      // Geen bewaarde instellingen: de standaardwaarden blijven gelden.
    }
  },
  update: (changes) => {
    set(changes);
    const { autoShare, keepAwake, mapView } = { ...get(), ...changes };
    AsyncStorage.setItem(KEY, JSON.stringify({ autoShare, keepAwake, mapView })).catch(() => {});
  },
}));
