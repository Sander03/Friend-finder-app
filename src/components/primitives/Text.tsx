import { Text as RNText, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme';

interface TextProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'normal' | 'medium' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  display?: boolean;
  testID?: string;
}

export function Text({
  children,
  size = 'md',
  weight = 'normal',
  color,
  align = 'left',
  numberOfLines,
  display = false,
  testID,
}: TextProps) {
  return (
    <RNText
      style={[
        styles.base,
        styles[size],
        styles[weight],
        display && styles.display,
        { textAlign: align },
        color !== undefined && { color },
      ]}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    fontFamily: fonts.body,
  },
  display: { fontFamily: fonts.display, letterSpacing: -0.3 },
  sm: { fontSize: 13, lineHeight: 18 },
  md: { fontSize: 15, lineHeight: 22 },
  lg: { fontSize: 18, lineHeight: 26 },
  xl: { fontSize: 24, lineHeight: 30 },
  xxl: { fontSize: 40, lineHeight: 44 },
  normal: { fontWeight: '400' },
  medium: { fontWeight: '600' },
  bold: { fontWeight: '700' },
});
