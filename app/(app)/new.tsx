import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { goBack, IconButton } from '../../src/components/IconButton';
import { Card } from '../../src/components/primitives/Card';
import { InputField } from '../../src/components/primitives/InputField';
import { Screen } from '../../src/components/primitives/Screen';
import { Stack } from '../../src/components/primitives/Stack';
import { Text } from '../../src/components/primitives/Text';
import { StyledButton } from '../../src/components/StyledButton';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useGroupStore } from '../../src/state/useGroupStore';
import { colors } from '../../src/theme';

// Een nieuwe groep maken of meedoen met de code van je vrienden.
export default function NewGroupScreen() {
  const { mode } = useLocalSearchParams<{ mode?: 'join' | 'create' }>();
  const user = useAuthStore((s) => s.user);
  const { join, create } = useGroupStore();

  const [code, setCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleJoin = async () => {
    if (user === null) return;
    if (code.trim() === '') {
      setJoinError('Vul de code van je vrienden in');
      return;
    }
    setJoinError('');
    setJoining(true);
    try {
      await join(code, user.id);
      router.replace('/map');
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : 'Lid worden mislukt');
    } finally {
      setJoining(false);
    }
  };

  const handleCreate = async () => {
    if (user === null) return;
    if (name.trim() === '') {
      setCreateError('Geef je groep een naam');
      return;
    }
    setCreateError('');
    setCreating(true);
    try {
      await create(name.trim(), place.trim(), user.id);
      router.replace('/group');
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Groep maken mislukt');
    } finally {
      setCreating(false);
    }
  };

  const joinCard = (
    <Card key="join">
      <Stack padding="md" gap="md">
        <Stack gap="sm">
          <Text size="lg" weight="bold" display>Meedoen met een code</Text>
          <Text size="sm" color={colors.textMuted}>Vraag de code van 6 tekens aan iemand uit de groep.</Text>
        </Stack>
        <InputField
          label="Groepscode"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="bv. BENDE1"
          autoCapitalize="characters"
          onSubmitEditing={handleJoin}
          error={joinError !== '' ? joinError : undefined}
          testID="code-input"
        />
        <StyledButton label="Lid worden" icon="enter-outline" onPress={handleJoin} isLoading={joining} testID="join-button" />
      </Stack>
    </Card>
  );

  const createCard = (
    <Card key="create">
      <Stack padding="md" gap="md">
        <Stack gap="sm">
          <Text size="lg" weight="bold" display>Nieuwe groep</Text>
          <Text size="sm" color={colors.textMuted}>
            Werkt overal: in het park, op het strand, in de stad of op een festival. Het delen stopt na 24 uur.
          </Text>
        </Stack>
        <InputField label="Naam van de groep" value={name} onChangeText={setName} placeholder="bv. Strandploeg" testID="new-group-name" />
        <InputField
          label="Waar? (optioneel)"
          value={place}
          onChangeText={setPlace}
          placeholder="bv. Strand Oostende"
          onSubmitEditing={handleCreate}
          error={createError !== '' ? createError : undefined}
          testID="new-group-place"
        />
        <StyledButton label="Groep maken" icon="add" onPress={handleCreate} isLoading={creating} testID="create-group" />
      </Stack>
    </Card>
  );

  return (
    <Screen padding="md">
      <Stack gap="lg">
        <View style={styles.top}>
          <IconButton icon="chevron-back" label="Terug" onPress={() => goBack('/')} testID="back-button" />
          <Text size="xl" weight="bold" display>Groep toevoegen</Text>
        </View>
        {mode === 'join' ? [joinCard, createCard] : [createCard, joinCard]}
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
