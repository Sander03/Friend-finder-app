import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { FriendRow } from '../../src/components/FriendRow';
import { Badge } from '../../src/components/primitives/Badge';
import { EmptyState } from '../../src/components/primitives/EmptyState';
import { Icon } from '../../src/components/primitives/Icon';
import { Screen } from '../../src/components/primitives/Screen';
import { Spinner } from '../../src/components/primitives/Spinner';
import { Text } from '../../src/components/primitives/Text';
import { Radar } from '../../src/components/Radar';
import { StyledButton } from '../../src/components/StyledButton';
import { useLocationSharing } from '../../src/hooks/useLocationSharing';
import { stopSharing } from '../../src/services/groupService';
import { useGroupStore } from '../../src/state/useGroupStore';
import { colors, radius } from '../../src/theme';
import type { Member } from '../../src/types/Group';

export default function MapScreen() {
  const { group, members, places, myMemberId, myPosition, status, error } = useGroupStore();
  const [sharing, setSharing] = useState(true);
  const permission = useLocationSharing(sharing);

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
          description="Doe mee met een groep via een code van je vrienden."
          action={<StyledButton label="Groep zoeken" onPress={() => router.push('/group')} />}
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
        <View style={{ flex: 1 }}>
          <Text size="sm" color={colors.textMuted}>{group.eventName}</Text>
          <Text size="xl" weight="bold" display>{group.name}</Text>
        </View>
        <Badge label={sharing ? 'Live' : 'Gepauzeerd'} variant={sharing ? 'success' : 'warning'} />
        <Pressable
          onPress={() => router.push('/group')}
          accessibilityRole="button"
          accessibilityLabel="Groep en uitnodigen"
          style={styles.iconButton}
          testID="group-button"
        >
          <Icon name="people-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      {myPosition?.isDemo === true && (
        <View style={styles.notice}>
          <Icon name="information-circle-outline" size={18} color={colors.warning} />
          <Text size="sm" color={colors.warning}>
            {permission === 'denied'
              ? 'Geen toegang tot je locatie. We tonen je op een demo-plek op het terrein.'
              : `Je bent niet op ${group.eventName}. We tonen je op een demo-plek op het terrein.`}
          </Text>
        </View>
      )}

      <View style={styles.radar}>
        {myPosition !== null ? (
          <Radar me={myPosition} members={friends} places={places} onSelectMember={openFriend} />
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
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: { flexDirection: 'row', gap: 8, marginHorizontal: 20, alignItems: 'flex-start' },
  radar: { flex: 1, minHeight: 280, padding: 8, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    maxHeight: '45%',
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
