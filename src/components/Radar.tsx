import { useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { distanceMeters, formatDistance, isStale, offsetMeters, type LatLng } from '../lib/geo';
import { colors } from '../theme';
import type { Member, Place } from '../types/Group';
import { Text } from './primitives/Text';

interface RadarProps {
  me: LatLng;
  members: Member[];
  places: Place[];
  onSelectMember: (member: Member) => void;
}

const MIN_RANGE_M = 60;
const MARKER = 38;
const PLACE_RADIUS_M = 10;
const PLACES_WITHIN_M = 1000;

export function Radar({ me, members, places: allPlaces, onSelectMember }: RadarProps) {
  const [size, setSize] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setSize(Math.min(e.nativeEvent.layout.width, e.nativeEvent.layout.height));

  const places = allPlaces.filter((p) => distanceMeters(me, p) <= PLACES_WITHIN_M);
  const located = members.filter((m) => m.location !== null);
  const offsets = [...located.map((m) => offsetMeters(me, m.location!)), ...places.map((p) => offsetMeters(me, p))];
  const furthest = Math.max(MIN_RANGE_M, ...offsets.map((o) => Math.max(Math.abs(o.east), Math.abs(o.north))));
  const range = [50, 75, 100, 125, 150, 200, 300, 400, 600, 1000, 2000, 3000, 5000, 10000, 25000, 50000].find((r) => r >= furthest * 1.08) ?? furthest * 1.08;

  const half = size / 2;
  const scale = (half - MARKER) / range;
  const project = (point: LatLng) => {
    const { east, north } = offsetMeters(me, point);
    return { x: half + east * scale, y: half - north * scale };
  };

  return (
    <View style={styles.container} onLayout={onLayout} accessibilityLabel="Plattegrond met je vrienden">
      {size > 0 && (
        <View style={{ width: size, height: size }}>
          {[1, 0.5].map((f) => (
            <View
              key={f}
              style={[
                styles.ring,
                { width: (half - MARKER) * 2 * f, height: (half - MARKER) * 2 * f, left: half - (half - MARKER) * f, top: half - (half - MARKER) * f },
              ]}
            />
          ))}
          <View style={[styles.ringLabel, { left: half + 6, top: MARKER - 9 }]}>
            <Text size="sm" color={colors.textMuted}>{formatDistance(range)}</Text>
          </View>
          <View style={[styles.north, { left: half - 10, top: 2 }]}>
            <Text size="sm" weight="bold" color={colors.textMuted}>N</Text>
          </View>

          {places.map((place) => {
            const { x, y } = project(place);
            const area = Math.max(28, PLACE_RADIUS_M * 2 * scale);
            return (
              <View key={place.id} pointerEvents="none">
                <View style={[styles.placeArea, { width: area, height: area, left: x - area / 2, top: y - area / 2 }]} />
                <View style={[styles.placeLabel, { left: x - 50, top: y - area / 2 - 18 }]}>
                  <Text size="sm" weight="medium" color="#8F95A3" align="center" numberOfLines={1}>
                    {place.name.toUpperCase()}
                  </Text>
                </View>
              </View>
            );
          })}

          <View style={[styles.meHalo, { left: half - 30, top: half - 30 }]} />

          {located.map((member) => {
            const { x, y } = project(member.location!);
            const stale = isStale(member.location!.updatedAt);
            const halo = Math.max(MARKER + 8, Math.min(120, (member.location!.accuracy ?? 0) * 2 * scale));
            return (
              <View key={member.id} style={[styles.markerWrap, { left: x - 50, top: y - MARKER / 2 }, stale && styles.stale]}>
                {!stale && (
                  <View
                    style={[
                      styles.halo,
                      { width: halo, height: halo, left: 50 - halo / 2, top: MARKER / 2 - halo / 2, backgroundColor: `${member.color}22`, borderColor: `${member.color}66` },
                    ]}
                  />
                )}
                <Pressable
                  onPress={() => onSelectMember(member)}
                  accessibilityRole="button"
                  accessibilityLabel={`${member.name} zoeken`}
                  style={[
                    styles.marker,
                    stale ? { borderColor: member.color, borderStyle: 'dashed', backgroundColor: colors.background } : { backgroundColor: member.color },
                  ]}
                >
                  <Text size="sm" weight="bold" color={stale ? member.color : colors.onAccent}>
                    {member.name.slice(0, 2).toUpperCase()}
                  </Text>
                </Pressable>
                <View style={styles.nameTag}>
                  <Text size="sm" weight="medium" numberOfLines={1}>{member.name}</Text>
                </View>
              </View>
            );
          })}
          <View style={[styles.me, { left: half - 11, top: half - 11 }]} accessibilityLabel="Jij" pointerEvents="none" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  ringLabel: { position: 'absolute' },
  north: { position: 'absolute', width: 20, alignItems: 'center' },
  placeArea: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  placeLabel: { position: 'absolute', width: 100 },
  meHalo: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(198, 244, 50, 0.14)' },
  me: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', borderWidth: 5, borderColor: colors.accent },
  markerWrap: { position: 'absolute', width: 100, alignItems: 'center' },
  stale: { opacity: 0.6 },
  halo: { position: 'absolute', borderRadius: 999, borderWidth: 1 },
  marker: {
    width: MARKER,
    height: MARKER,
    borderRadius: MARKER / 2,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameTag: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: colors.background, maxWidth: 100 },
});
