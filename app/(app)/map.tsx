import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { FriendRow } from '../../src/components/FriendRow';
import { goBack, IconButton } from '../../src/components/IconButton';
import { LiveMap } from '../../src/components/LiveMap';
import { Badge } from '../../src/components/primitives/Badge';
import { EmptyState } from '../../src/components/primitives/EmptyState';
import { Icon } from '../../src/components/primitives/Icon';
import { Screen } from '../../src/components/primitives/Screen';
import { Spinner } from '../../src/components/primitives/Spinner';
import { Text } from '../../src/components/primitives/Text';
import { Radar } from '../../src/components/Radar';
import { StyledButton } from '../../src/components/StyledButton';
import { useKeepAwake } from '../../src/hooks/useKeepAwake';
import { useLocationSharing } from '../../src/hooks/useLocationSharing';
import { stopSharing } from '../../src/services/groupService';
import { useGroupStore } from '../../src/state/useGroupStore';
import { useSettingsStore } from '../../src/state/useSettingsStore';
import { colors, radius } from '../../src/theme';
import type { Member } from '../../src/types/Group';

export default function MapScreen() {
  const { group, members, places, myMemberId, myPosition, status, error } = useGroupStore();
  const { autoShare, keepAwake, mapView, update } = useSettingsStore();
  const [sharing, setSharing] = useState(autoShare);
  const permission = useLocationSharing(sharing);
  useKeepAwake(keepAwake && group !== null);

  if (status === 'loading' || status === 'idle') {
    return (
      <Screen scrollable={false}>
        <View style={styles.center}><Spinner size="large" /></View>
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen>
        <EmptyState title="Kan de groep niet laden" description={error ?? undefined} />
      </Screen>
    );
  }

  if (group === null) {
    return (
      <Screen>
        <EmptyState
          title="Nog geen groep"
          description="Maak een groep, of doe mee met de code van je vrienden. Werkt overal: in het park, op het strand of op een festival."
          action={<StyledButton label="Groep maken of meedoen" onPress={() => router.replace('/new')} />}
        />
      </Screen>
    );
  }

  const friends = members.filter((m) => m.id !== myMemberId);
  const live = friends.filter((m) => m.location !== null).length;
  const openFriend = (member: Member) => router.push({ pathname: '/friend', params: { id: member.id } });

  const toggleSharing = () => {
    if (sharing && myMemberId !== null) void stopSharing(myMemberId);
    setSharing(!sharing);
  };

  return (
    <Screen padding="none" scrollable={false}>
      <View style={styles.header}>
        <IconButton icon="home-outline" label="Naar de startpagina" onPress={() => goBack('/')} testID="home-button" />
        <View style={{ flex: 1 }}>
          {group.eventName !== '' && <Text size="sm" color={colors.textMuted}>{group.eventName}</Text>}
          <Text size="xl" weight="bold" display>{group.name}</Text>
        </View>
        <Badge label={sharing ? 'Live' : 'Gepauzeerd'} variant={sharing ? 'success' : 'warning'} />
        <IconButton icon="people-outline" label="Groep en uitnodigen" onPress={() => router.push('/group')} testID="group-button" />
      </View>

      {myPosition?.isDemo === true && (
        <View style={styles.notice}>
          <Icon name="information-circle-outline" size={18} color={colors.warning} />
          <Text size="sm" color={colors.warning}>
            {permission === 'denied'
              ? 'Geen toegang tot je locatie. Dit is een demo-groep, dus we tonen je op een plek op het terrein.'
              : 'Dit is een demo-groep en je bent er niet in de buurt. We tonen je op een plek op het terrein.'}
          </Text>
        </View>
      )}

      {Platform.OS === 'web' && (
        <View style={styles.switch} accessibilityRole="tablist">
          {(['radar', 'map'] as const).map((view) => (
            <Pressable
              key={view}
              onPress={() => update({ mapView: view })}
              accessibilityRole="tab"
              accessibilityState={{ selected: mapView === view }}
              style={[styles.switchItem, mapView === view && styles.switchActive]}
              testID={`view-${view}`}
            >
              <Icon name={view === 'radar' ? 'radio-outline' : 'map-outline'} size={16} color={mapView === view ? colors.onAccent : colors.textMuted} />
              <Text size="sm" weight="medium" color={mapView === view ? colors.onAccent : colors.textMuted}>
                {view === 'radar' ? 'Radar' : 'Kaart'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.radar}>
        {myPosition !== null ? (
          mapView === 'map' ? (
            <LiveMap me={myPosition} members={friends} places={places} onSelectMember={openFriend} />
          ) : (
            <Radar me={myPosition} members={friends} places={places} onSelectMember={openFriend} />
          )
        ) : permission === 'denied' || !sharing ? (
          <EmptyState
            title={sharing ? 'Geen toegang tot je locatie' : 'Locatie gepauzeerd'}
            description={
              sharing
                ? 'Geef Waarbenje toegang tot je locatie in je browserinstellingen om je vrienden te vinden.'
                : 'Deel je locatie om je vrienden op de kaart te zien.'
            }
          />
        ) : (
          <Spinner size="large" />
        )}
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text size="lg" weight="bold" display>Vrienden</Text>
          <Text size="sm" color={colors.textMuted}>{live} van {friends.length} live</Text>
        </View>
        <ScrollView style={styles.list}>
          {friends.map((member) => (
            <FriendRow
              key={member.id}
              member={member}
              me={myPosition}
              places={places}
              onPress={() => openFriend(member)}
            />
          ))}
        </ScrollView>
        <StyledButton
          label={sharing ? 'Pauzeer mijn locatie' : 'Deel mijn locatie'}
          icon={sharing ? 'pause' : 'navigate'}
          variant={sharing ? 'secondary' : 'primary'}
          onPress={toggleSharing}
          testID="share-toggle"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switch: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 4,
    padding: 4,
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 14, borderRadius: radius.pill },
  switchActive: { backgroundColor: colors.accent },
  notice: { flexDirection: 'row', gap: 8, marginHorizontal: 20, alignItems: 'flex-start' },
  radar: { flex: 1, minHeight: 280, padding: 8, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    maxHeight: '40%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 4 },
  list: { flexGrow: 0, borderRadius: radius.sm },
});
