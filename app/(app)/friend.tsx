import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { DirectionDial } from '../../src/components/DirectionDial';
import { placeLabel } from '../../src/components/FriendRow';
import { Avatar } from '../../src/components/primitives/Avatar';
import { Badge } from '../../src/components/primitives/Badge';
import { Card } from '../../src/components/primitives/Card';
import { EmptyState } from '../../src/components/primitives/EmptyState';
import { Icon } from '../../src/components/primitives/Icon';
import { Screen } from '../../src/components/primitives/Screen';
import { Stack } from '../../src/components/primitives/Stack';
import { Text } from '../../src/components/primitives/Text';
import { StyledButton } from '../../src/components/StyledButton';
import { bearingDegrees, compassWord, distanceMeters, formatDistance, timeAgo } from '../../src/lib/geo';
import { useGroups } from '../../src/state/GroupContext';
import { colors } from '../../src/theme';

function BackButton() {
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/map'))}
      accessibilityRole="button"
      accessibilityLabel="Terug naar de kaart"
      style={styles.back}
      testID="back-button"
    >
      <Icon name="chevron-back" size={22} color={colors.text} />
    </Pressable>
  );
}

export default function FriendScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { members, myPosition: me, places } = useGroups();
  const member = members.find((m) => m.id === id);

  if (member === undefined || member.location === null || me === null) {
    return (
      <Screen>
        <BackButton />
        <EmptyState
          title="Vriend niet gevonden"
          description={
            me === null
              ? 'Je eigen locatie delen komt in een volgende versie. Probeer het in de demo-groep De Bende.'
              : 'Deze vriend deelt op dit moment geen locatie.'
          }
        />
      </Screen>
    );
  }

  const loc = member.location;
  const meters = distanceMeters(me, loc);
  const bearing = bearingDegrees(me, loc);
  const label = placeLabel(loc, places);

  return (
    <Screen padding="md">
      <Stack gap="lg" flex={1}>
        <View style={styles.top}>
          <BackButton />
          <View style={{ flex: 1 }}>
            <Text size="lg" weight="bold" display>{member.name} zoeken</Text>
            <Text size="sm" color={colors.textMuted}>Laatst gezien {timeAgo(loc.updatedAt)}</Text>
          </View>
          <Avatar name={member.name} color={member.color} />
        </View>

        <DirectionDial bearing={bearing} color={member.color} />

        <Stack gap="sm" align="center">
          <Text size="xxl" weight="bold" display testID="distance">{formatDistance(meters)}</Text>
          <Text weight="medium" align="center">Richting het {compassWord(bearing)}</Text>
          {label !== null && <Text color={colors.textMuted} align="center">{label}</Text>}
          {loc.accuracy !== null && (
            <View style={{ alignSelf: 'center' }}>
              <Badge label={`GPS ± ${Math.round(loc.accuracy)} m`} />
            </View>
          )}
        </Stack>

        {loc.note !== '' && (
          <Card>
            <Stack padding="md" gap="sm">
              <Text size="sm" color={colors.textMuted}>Bericht van {member.name}</Text>
              <Text weight="medium">“{loc.note}”</Text>
            </Stack>
          </Card>
        )}

        <View style={{ flex: 1 }} />
        <StyledButton
          label="Flash mijn scherm"
          icon="flash"
          onPress={() => router.push({ pathname: '/flash', params: { name: member.name, color: member.color } })}
          testID="flash-button"
        />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
