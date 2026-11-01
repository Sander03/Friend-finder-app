import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../../theme';
import { Text } from './Text';

interface ToastProps {
  message: string;
  variant?: 'default' | 'success' | 'error';
  visible: boolean;
}

export function Toast({ message, variant = 'default', visible }: ToastProps) {
  if (!visible) return null;

  return (
    <View style={[styles.base, styles[variant]]} accessibilityLiveRegion="polite">
      <Text size="sm" weight="medium" color={variant === 'default' ? colors.text : colors.onAccent}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  default: { backgroundColor: colors.surfaceRaised },
  success: { backgroundColor: colors.accent },
  error: { backgroundColor: colors.danger },
});
