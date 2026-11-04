import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Spinner } from '../../src/components/primitives/Spinner';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useGroupStore } from '../../src/state/useGroupStore';
import { useSettingsStore } from '../../src/state/useSettingsStore';
import { colors } from '../../src/theme';

export default function AppLayout() {
  const isReady = useAuthStore((s) => s.isReady);
  const user = useAuthStore((s) => s.user);
  const load = useGroupStore((s) => s.load);
  const reset = useGroupStore((s) => s.reset);
  const loadSettings = useSettingsStore((s) => s.load);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (user !== null) void load(user.id);
    else reset();
  }, [user, load, reset]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Spinner size="large" />
      </View>
    );
  }
  if (user === null) return <Redirect href="/login" />;

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
