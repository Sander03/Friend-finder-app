import { View, Image, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { Text } from './Text';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Avatar({ uri, name, size = 'md', color = colors.accent }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (uri !== undefined) {
    return <Image source={{ uri }} style={[styles.base, styles[size]]} />;
  }

  return (
    <View style={[styles.base, styles[size], { backgroundColor: color }]}>
      <Text size={size === 'lg' ? 'lg' : 'sm'} weight="bold" color={colors.onAccent} display>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 999, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  sm: { width: 32, height: 32 },
  md: { width: 42, height: 42 },
  lg: { width: 64, height: 64 },
});
