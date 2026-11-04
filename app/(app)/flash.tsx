import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../src/components/primitives/Text';
import { colors, radius } from '../../src/theme';

// Knippert twee keer per seconde in de kleur van je vriend, zodat die je in de menigte ziet.
export default function FlashScreen() {
  const { name = 'Je vriend', color = colors.accent } = useLocalSearchParams<{ name?: string; color?: string }>();
  const [on, setOn] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setOn((v) => !v), 250);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: on ? color : '#FFFFFF' }]}>
      <View style={styles.middle}>
        <View style={styles.ring}>
          <Text size="xxl" weight="bold" color={colors.onAccent} display>JIJ</Text>
        </View>
        <Text size="xxl" weight="bold" color={colors.onAccent} align="center" display>
          Steek je gsm omhoog
        </Text>
        <Text size="lg" weight="medium" color={colors.onAccent} align="center">
          {name} zoekt naar dit scherm
        </Text>
      </View>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/map'))}
        accessibilityRole="button"
        style={styles.stop}
        testID="stop-flash"
      >
        <Text weight="medium" color="#FFFFFF">Gevonden — stoppen</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  ring: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: colors.onAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stop: {
    minHeight: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.onAccent,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
});
