import { ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export function Spinner({ size = 'small', color = colors.accent }: SpinnerProps) {
  return <ActivityIndicator size={size} color={color} style={styles.base} />;
}

const styles = StyleSheet.create({
  base: {},
});
