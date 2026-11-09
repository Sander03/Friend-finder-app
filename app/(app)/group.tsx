import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { goBack, IconButton } from '../../src/components/IconButton';
import { Avatar } from '../../src/components/primitives/Avatar';
import { Card } from '../../src/components/primitives/Card';
import { EmptyState } from '../../src/components/primitives/EmptyState';
import { Icon } from '../../src/components/primitives/Icon';
import { Row } from '../../src/components/primitives/Row';
import { Screen } from '../../src/components/primitives/Screen';
import { Stack } from '../../src/components/primitives/Stack';
import { Text } from '../../src/components/primitives/Text';
import { StyledButton } from '../../src/components/StyledButton';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useGroups } from '../../src/state/GroupContext';
import { colors } from '../../src/theme';

export default function GroupScreen() {
  const user = useAuthStore((s) => s.user);
  const { group, members, leave } = useGroups();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState('');

  if (group === null) {
    return (
      <Screen>
        <IconButton icon="chevron-back" label="Terug" onPress={() => goBack('/')} />
        <EmptyState
          title="Geen actieve groep"
          description="Maak een groep of doe mee met de code van je vrienden."
          action={<StyledButton label="Groep toevoegen" onPress={() => router.replace('/new')} />}
        />
      </Screen>
    );
  }

  const handleLeave = async () => {
    if (user === null) return;
    if (!confirmLeave) {
      setConfirmLeave(true);
      return;
    }
    setLeaving(true);
    setError('');
    try {
      await leave(user.id);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Groep verlaten mislukt');
      setLeaving(false);
    }
  };

  const endDate = new Date(group.endsAt);
  const endsAt = endDate.toLocaleString('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: endDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Screen padding="md">
      <Stack gap="lg">
        <View style={styles.top}>
          <IconButton icon="chevron-back" label="Terug" onPress={() => goBack('/map')} testID="back-button" />
          <View style={{ flex: 1 }}>
            {group.eventName !== '' && <Text size="sm" color={colors.textMuted}>{group.eventName}</Text>}
            <Text size="xl" weight="bold" display>{group.name}</Text>
          </View>
        </View>

        <Card>
          <Stack padding="lg" gap="sm" align="center">
            <Text size="sm" color={colors.textMuted}>Groepscode</Text>
            <Text size="xxl" weight="bold" display testID="join-code">{group.joinCode}</Text>
            <Text size="sm" color={colors.textMuted} align="center">
              Vrienden vullen deze code in via "Code invoeren" op hun startpagina.
            </Text>
          </Stack>
        </Card>

        <Card>
          <Row gap="md" align="flex-start">
            <View style={{ paddingTop: 16, paddingLeft: 16 }}>
              <Icon name="shield-checkmark-outline" size={22} color={colors.accent} />
            </View>
            <Stack gap="sm" padding="md" flex={1}>
              <Text weight="medium">Groep stopt vanzelf</Text>
              <Text size="sm" color={colors.textMuted}>
                Alleen zichtbaar voor de leden van deze groep, tot {endsAt}.
              </Text>
            </Stack>
          </Row>
        </Card>

        <Stack gap="sm">
          <Text size="sm" weight="medium" color="#C4C8D0">Leden ({members.length})</Text>
          <Row gap="sm" wrap>
            {members.map((m) => (
              <Stack key={m.id} align="center" gap="sm">
                <Avatar name={m.name} color={m.color} />
                <Text size="sm">{m.userId === user?.id ? 'Jij' : m.name}</Text>
              </Stack>
            ))}
          </Row>
        </Stack>

        <Stack gap="sm">
          {confirmLeave && (
            <Text size="sm" color={colors.danger} align="center">
              Zeker? Je hebt de code nodig om terug te komen.
            </Text>
          )}
          {error !== '' && <Text size="sm" color={colors.danger} align="center">{error}</Text>}
          <StyledButton
            label={confirmLeave ? 'Ja, verlaat de groep' : 'Groep verlaten'}
            variant="ghost"
            icon="exit-outline"
            onPress={handleLeave}
            isLoading={leaving}
            testID="leave-group"
          />
        </Stack>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
