import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Spinner } from '../../src/components/primitives/Spinner';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useGroups } from '../../src/state/GroupContext';
import { colors } from '../../src/theme';

export default function AppLayout() {
  const { isReady, user } = useAuthStore();
  const { load, reset } = useGroups();

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
