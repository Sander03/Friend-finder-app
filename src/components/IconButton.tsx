import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { Icon } from './primitives/Icon';

interface IconButtonProps {
  icon: ComponentProps<typeof Icon>['name'];
  label: string;
  onPress: () => void;
  testID?: string;
}

// Vierkante knop met enkel een icoon, bv. terug of instellingen.
export function IconButton({ icon, label, onPress, testID }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon name={icon} size={22} color={colors.text} />
    </Pressable>
  );
}

// Terug naar het vorige scherm, of naar de startpagina als er geen vorig scherm is.
export function goBack(fallback: '/' | '/map' = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.border },
});
