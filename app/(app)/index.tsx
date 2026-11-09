import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { IconButton } from '../../src/components/IconButton';
import { Avatar } from '../../src/components/primitives/Avatar';
import { Badge } from '../../src/components/primitives/Badge';
import { Card } from '../../src/components/primitives/Card';
import { EmptyState } from '../../src/components/primitives/EmptyState';
import { Icon } from '../../src/components/primitives/Icon';
import { Screen } from '../../src/components/primitives/Screen';
import { Spinner } from '../../src/components/primitives/Spinner';
import { Stack } from '../../src/components/primitives/Stack';
import { Text } from '../../src/components/primitives/Text';
import { StyledButton } from '../../src/components/StyledButton';
import { isExpired, timeLeft } from '../../src/lib/geo';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useGroups } from '../../src/state/GroupContext';
import { colors, radius } from '../../src/theme';
import type { GroupSummary } from '../../src/types/Group';

// Startpagina: je actieve groep, al je groepen en snelkoppelingen.
export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const { groups, group, members, myMemberId, status, error, select } = useGroups();

  const firstName = user?.name.split(' ')[0] ?? '';
  const friends = members.filter((m) => m.id !== myMemberId);
  const live = friends.filter((m) => m.location !== null).length;

  const openGroup = async (g: GroupSummary) => {
    if (user === null) return;
    await select(g.id, user.id);
    router.push('/map');
  };

  return (
    <Screen padding="md">
      <Stack gap="lg">
        <View style={styles.top}>
          <Pressable onPress={() => router.push('/settings')} accessibilityRole="button" accessibilityLabel="Profiel en afmelden">
            <Avatar name={user?.name} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text size="sm" color={colors.textMuted}>Waarbenje</Text>
            <Text size="xl" weight="bold" display>Hoi {firstName}</Text>
          </View>
          <IconButton icon="settings-outline" label="Instellingen" onPress={() => router.push('/settings')} testID="settings-button" />
        </View>

        {status === 'loading' || status === 'idle' ? (
          <View style={styles.loading}><Spinner size="large" /></View>
        ) : status === 'error' ? (
          <EmptyState title="Kan je groepen niet laden" description={error ?? undefined} />
        ) : group === null ? (
          <Card>
            <Stack padding="lg" gap="md" align="center">
              <View style={styles.bigIcon}>
                <Icon name="people" size={30} color={colors.onAccent} />
              </View>
              <Text size="lg" weight="bold" display align="center">Nog geen groep</Text>
              <Text color={colors.textMuted} align="center">
                Maak een groep voor je dag aan het strand, in het park of op een festival, of doe mee met de code van je vrienden.
              </Text>
              <StyledButton label="Groep maken of meedoen" icon="add" onPress={() => router.push('/new')} testID="empty-new-group" />
            </Stack>
          </Card>
        ) : (
          <View style={styles.hero} testID="active-group">
            <View style={styles.heroTop}>
              <Text size="sm" weight="medium" color={colors.onAccent}>Actieve groep</Text>
              <Text size="sm" weight="medium" color={colors.onAccent}>{timeLeft(group.endsAt)}</Text>
            </View>
            <Text size="xxl" weight="bold" display color={colors.onAccent}>{group.name}</Text>
            {group.eventName !== '' && (
              <View style={styles.heroPlace}>
                <Icon name="location-outline" size={16} color={colors.onAccent} />
                <Text weight="medium" color={colors.onAccent}>{group.eventName}</Text>
              </View>
            )}
            <View style={styles.heroAvatars}>
              {friends.slice(0, 5).map((m, i) => (
                <View key={m.id} style={[styles.avatarRing, { marginLeft: i === 0 ? 0 : -10 }]}>
                  <Avatar name={m.name} color={m.color} size="sm" />
                </View>
              ))}
              <View style={{ marginLeft: friends.length > 0 ? 10 : 0 }}>
                <Text size="sm" weight="medium" color={colors.onAccent}>
                  {friends.length === 0 ? 'Nog niemand anders: deel de code' : `${live} van ${friends.length} vrienden live`}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/map')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.heroButton, pressed && { opacity: 0.85 }]}
              testID="open-map"
            >
              <Icon name="navigate" size={18} color={colors.accent} />
              <Text weight="bold" color={colors.accent}>Open de kaart</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.actions}>
          <QuickAction icon="add-circle-outline" label="Nieuwe groep" onPress={() => router.push('/new')} testID="new-group" />
          <QuickAction icon="keypad-outline" label="Code invoeren" onPress={() => router.push({ pathname: '/new', params: { mode: 'join' } })} testID="join-group" />
          <QuickAction
            icon="share-social-outline"
            label="Uitnodigen"
            onPress={() => router.push(group !== null ? '/group' : '/new')}
            testID="invite"
          />
        </View>

        {groups.length > 0 && (
          <Stack gap="sm">
            <View style={styles.sectionTitle}>
              <Text size="lg" weight="bold" display>Jouw groepen</Text>
              <Text size="sm" color={colors.textMuted}>{groups.length}</Text>
            </View>
            <Card>
              {groups.map((g, i) => (
                <GroupRow
                  key={g.id}
                  group={g}
                  active={g.id === group?.id}
                  last={i === groups.length - 1}
                  onPress={() => void openGroup(g)}
                />
              ))}
            </Card>
          </Stack>
        )}

        <Card>
          <View style={styles.tip}>
            <Icon name="shield-checkmark-outline" size={22} color={colors.accent} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text weight="medium">Jij beslist wie je ziet</Text>
              <Text size="sm" color={colors.textMuted}>
                Een groep is alleen zichtbaar voor de leden en stopt vanzelf als ze verloopt.
                {Platform.OS === 'web' ? ' Tip: zet Waarbenje op je beginscherm via "Toevoegen aan startscherm".' : ''}
              </Text>
            </View>
          </View>
        </Card>
      </Stack>
    </Screen>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={({ pressed }) => [styles.action, pressed && { backgroundColor: colors.surfaceRaised }]}
    >
      <Icon name={icon} size={24} color={colors.accent} />
      <Text size="sm" weight="medium" align="center">{label}</Text>
    </Pressable>
  );
}

function GroupRow({ group, active, last, onPress }: { group: GroupSummary; active: boolean; last: boolean; onPress: () => void }) {
  const expired = isExpired(group.endsAt);
  const details = [group.eventName, `${group.memberCount} ${group.memberCount === 1 ? 'lid' : 'leden'}`].filter((d) => d !== '');
  return (
    <Pressable
      onPress={onPress}
      disabled={expired}
      accessibilityRole="button"
      accessibilityLabel={`${group.name}, ${expired ? 'verlopen' : timeLeft(group.endsAt)}`}
      testID={`group-${group.joinCode}`}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, expired && { opacity: 0.5 }, pressed && styles.rowPressed]}
    >
      <View style={[styles.rowIcon, active && { backgroundColor: colors.accent }]}>
        <Text weight="bold" display color={active ? colors.onAccent : colors.text}>{group.name.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text weight="medium" numberOfLines={1}>{group.name}</Text>
        <Text size="sm" color={colors.textMuted} numberOfLines={1}>{details.join(' · ')}</Text>
      </View>
      {active ? <Badge label="Actief" variant="success" /> : <Text size="sm" color={colors.textMuted}>{timeLeft(group.endsAt)}</Text>}
      {!expired && <Icon name="chevron-forward" size={18} color="#6B7180" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  loading: { paddingVertical: 48, alignItems: 'center' },
  bigIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { backgroundColor: colors.accent, borderRadius: radius.lg, padding: 20, gap: 8 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  heroPlace: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroAvatars: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  avatarRing: { borderRadius: 999, borderWidth: 2, borderColor: colors.accent },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.onAccent,
  },
  actions: { flexDirection: 'row', gap: 8 },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 64 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowPressed: { backgroundColor: colors.surfaceRaised },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip: { flexDirection: 'row', gap: 12, padding: 16, alignItems: 'flex-start' },
});
