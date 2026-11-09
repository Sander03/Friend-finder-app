import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

const KEY = 'waarbenje.settings';

interface Settings {
  // Radar (plattegrond rond jou) of echte kaart (OpenStreetMap).
  mapView: 'radar' | 'map';
}

interface SettingsContextValue extends Settings {
  update: (changes: Partial<Settings>) => void;
}

const defaults: Settings = { mapView: 'radar' };

const SettingsContext = createContext<SettingsContextValue | null>(null);

// Instellingen bewaren we alleen op dit toestel.
export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<Settings>(defaults);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((saved) => {
        if (saved !== null) setSettings({ ...defaults, ...(JSON.parse(saved) as Partial<Settings>) });
      })
      .catch(() => {
        // Geen bewaarde instellingen: de standaardwaarden blijven gelden.
      });
  }, []);

  const update = useCallback((changes: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...changes };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({ ...settings, update }), [settings, update]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (context === null) throw new Error('useSettings moet binnen een SettingsProvider gebruikt worden');
  return context;
}
