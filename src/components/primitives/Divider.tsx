import { View, StyleSheet } from 'react-native';
import { colors, spacing as space } from '../../theme';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export function Divider({ orientation = 'horizontal', spacing = 'none' }: DividerProps) {
  const margin = space[spacing];
  return (
    <View
      style={[
        styles.base,
        orientation === 'horizontal'
          ? [styles.horizontal, { marginVertical: margin }]
          : [styles.vertical, { marginHorizontal: margin }],
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.border },
  horizontal: { height: 1, width: '100%' },
  vertical: { width: 1, height: '100%' },
});
