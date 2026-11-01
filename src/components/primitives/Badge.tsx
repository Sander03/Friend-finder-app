import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { Text } from './Text';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const textColors = {
  default: colors.text,
  success: colors.accent,
  warning: colors.warning,
  error: colors.danger,
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text size="sm" weight="medium" color={textColors[variant]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  default: { backgroundColor: colors.surfaceRaised },
  success: { backgroundColor: '#1F2A10' },
  warning: { backgroundColor: '#2A2210' },
  error: { backgroundColor: '#2A1712' },
});
