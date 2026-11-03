import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import { Avatar } from '../../src/components/primitives/Avatar';
import { Card } from '../../src/components/primitives/Card';
import { Icon } from '../../src/components/primitives/Icon';
import { InputField } from '../../src/components/primitives/InputField';
import { Row } from '../../src/components/primitives/Row';
import { Screen } from '../../src/components/primitives/Screen';
import { Stack } from '../../src/components/primitives/Stack';
import { Text } from '../../src/components/primitives/Text';
import { StyledButton } from '../../src/components/StyledButton';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useGroupStore } from '../../src/state/useGroupStore';
import { colors } from '../../src/theme';

export default function GroupScreen() {
  const { user, logout } = useAuthStore();
  const { group, members, join } = useGroupStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (user === null || code.trim() === '') return;
    setError('');
    setJoining(true);
    try {
      await join(code, user.id);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lid worden mislukt');
    } finally {
      setJoining(false);
    }
  };

  const shareCode = () => {
    if (group === null) return;
    Share.share({ message: `Doe mee met ${group.name} op Waarbenje met code ${group.joinCode}` }).catch(() => {
      // Delen wordt niet door elke browser ondersteund; de code staat al op het scherm.
    });
  };

  const endDate = group !== null ? new Date(group.endsAt) : null;
  const endsAt = endDate !== null
    ? endDate.toLocaleDateString('nl-BE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        // het jaar alleen tonen als het niet dit jaar is
        year: endDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      })
    : '';

  return (
    <Screen padding="md">
      <Stack gap="lg">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
          accessibilityLabel="Terug naar de kaart"
          style={styles.back}
        >
          <Icon name="chevron-back" size={22} color={colors.text} />
        </Pressable>

        {group !== null && (
          <>
            <Stack gap="sm">
              <Text size="sm" color={colors.textMuted}>{group.eventName}</Text>
              <Text size="xxl" weight="bold" display>{group.name}</Text>
            </Stack>

            <Card>
              <Stack padding="lg" gap="sm" align="center">
                <Text size="sm" color={colors.textMuted}>Groepscode</Text>
                <Text size="xxl" weight="bold" display testID="join-code">{group.joinCode}</Text>
                <Text size="sm" color={colors.textMuted} align="center">
                  Vrienden vullen deze code in om mee te doen.
                </Text>
              </Stack>
            </Card>
            <StyledButton label="Code delen" icon="share-outline" onPress={shareCode} />

            <Card>
              <Row gap="md" align="flex-start">
                <View style={{ paddingTop: 16, paddingLeft: 16 }}>
                  <Icon name="shield-checkmark-outline" size={22} color={colors.accent} />
                </View>
                <Stack gap="sm" padding="md" flex={1}>
                  <Text weight="medium">Locatie delen stopt vanzelf</Text>
                  <Text size="sm" color={colors.textMuted}>
                    Alleen zichtbaar voor deze groep, tot {endsAt}. Je kan altijd pauzeren.
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
          </>
        )}

        <Stack gap="md">
          <Text size="lg" weight="bold" display>Andere groep</Text>
          <InputField
            label="Groepscode"
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            placeholder="bv. BENDE1"
            autoCapitalize="characters"
            onSubmitEditing={handleJoin}
            error={error !== '' ? error : undefined}
            testID="code-input"
          />
          <StyledButton label="Lid worden" variant="secondary" onPress={handleJoin} isLoading={joining} />
        </Stack>

        <StyledButton
          label={`Afmelden${user !== null ? ` (${user.email})` : ''}`}
          variant="ghost"
          icon="log-out-outline"
          onPress={() => void logout().then(() => router.replace('/login'))}
          testID="logout-button"
        />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
