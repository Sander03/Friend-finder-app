import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';

interface DirectionDialProps {
  bearing: number;
  color: string;
  size?: number;
}

export function DirectionDial({ bearing, color, size = 280 }: DirectionDialProps) {
  const c = size / 2;
  const r = c - 4;
  return (
    <View style={styles.wrap} accessibilityRole="image" accessibilityLabel={`Pijl naar ${Math.round(bearing)} graden`}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={c} cy={c} r={r} fill={colors.surface} stroke={colors.borderStrong} strokeWidth={1} />
        <Circle cx={c} cy={c} r={r * 0.7} fill="none" stroke={colors.border} strokeWidth={1} />
        <Circle cx={c} cy={c} r={r * 0.4} fill="none" stroke={colors.border} strokeWidth={1} />
        {[0, 90, 180, 270].map((deg) => (
          <Line
            key={deg}
            x1={c}
            y1={c - r + 8}
            x2={c}
            y2={c - r + 20}
            stroke={colors.borderStrong}
            strokeWidth={2}
            strokeLinecap="round"
            transform={`rotate(${deg} ${c} ${c})`}
          />
        ))}
        <SvgText x={c} y={c - r + 38} fill={colors.textMuted} fontSize={13} fontWeight="600" textAnchor="middle">
          N
        </SvgText>
        <G transform={`rotate(${bearing} ${c} ${c})`}>
          <Path
            d={`M ${c} ${c - r * 0.68} L ${c + r * 0.27} ${c + r * 0.17} L ${c} ${c + r * 0.04} L ${c - r * 0.27} ${c + r * 0.17} Z`}
            fill={color}
          />
        </G>
        <Circle cx={c} cy={c} r={7} fill={colors.text} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center' },
});
