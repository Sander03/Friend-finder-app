import { Pressable, StyleSheet, View } from 'react-native';
import { distanceMeters, formatDistance, isStale, nearest, timeAgo, type LatLng } from '../lib/geo';
import { colors } from '../theme';
import type { Member, Place } from '../types/Group';
import { Avatar } from './primitives/Avatar';
import { Icon } from './primitives/Icon';
import { Text } from './primitives/Text';

interface FriendRowProps {
  member: Member;
  me: LatLng | null;
  places: Place[];
  onPress: () => void;
}

export function placeLabel(point: LatLng, places: Place[]): string | null {
  const closest = nearest(point, places);
  if (closest === null || closest.meters > 500) return null;
  return closest.meters < 40 ? `Bij ${closest.item.name}` : `Richting ${closest.item.name}`;
}

export function FriendRow({ member, me, places, onPress }: FriendRowProps) {
  const loc = member.location;
  const stale = loc !== null && isStale(loc.updatedAt);
  const label = loc !== null ? placeLabel(loc, places) : null;
  const status =
    loc === null ? 'Deelt geen locatie' : label !== null ? `${label} · ${timeAgo(loc.updatedAt)}` : `Gezien ${timeAgo(loc.updatedAt)}`;
  const distance = loc !== null && me !== null ? formatDistance(distanceMeters(me, loc)) : '–';

  return (
    <Pressable
      onPress={onPress}
      disabled={loc === null}
      accessibilityRole="button"
      accessibilityLabel={`${member.name}, ${status}, ${distance}`}
      testID={`friend-${member.name}`}
      style={({ pressed }) => [styles.row, (stale || loc === null) && styles.dim, pressed && styles.pressed]}
    >
      <Avatar name={member.name} color={member.color} />
      <View style={styles.text}>
        <Text weight="medium">{member.name}</Text>
        <Text size="sm" color={colors.textMuted} numberOfLines={1}>{status}</Text>
      </View>
      <Text weight="bold" display>{distance}</Text>
      <Icon name="chevron-forward" size={18} color="#6B7180" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  text: { flex: 1, minWidth: 0 },
  dim: { opacity: 0.6 },
  pressed: { backgroundColor: colors.surfaceRaised },
});
