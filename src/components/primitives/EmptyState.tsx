import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { Text } from './Text';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.base}>
      <Text size="lg" weight="bold" align="center" display>{title}</Text>
      {description !== undefined && <Text align="center" color={colors.textMuted}>{description}</Text>}
      {action !== undefined && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 32 },
  action: { marginTop: 8, alignSelf: 'stretch' },
});
