import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GroupProvider } from '../src/state/GroupContext';
import { SettingsProvider } from '../src/state/SettingsContext';
import { useAuthStore } from '../src/state/useAuthStore';
import { colors } from '../src/theme';

// De login zit in een Zustand-store (useAuthStore); groepen en instellingen delen we via React Context.
export default function RootLayout() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => init(), [init]);

  return (
    <SafeAreaProvider style={{ backgroundColor: colors.background }}>
      <SettingsProvider>
        <GroupProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
        </GroupProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
