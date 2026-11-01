import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '../src/components/primitives/Icon';
import { InputField } from '../src/components/primitives/InputField';
import { Screen } from '../src/components/primitives/Screen';
import { Stack } from '../src/components/primitives/Stack';
import { Text } from '../src/components/primitives/Text';
import { StyledButton } from '../src/components/StyledButton';
import { isSupabaseConfigured } from '../src/lib/supabase';
import { useAuthStore } from '../src/state/useAuthStore';
import { colors } from '../src/theme';

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const { login, signUp, isLoading, isAuthenticated } = useAuthStore();

  if (isAuthenticated) return <Redirect href="/" />;

  const handleSubmit = async () => {
    setError('');
    setInfo('');
    if (email.trim() === '' || password === '' || (mode === 'signup' && name.trim() === '')) {
      setError('Vul alle velden in.');
      return;
    }
    try {
      if (mode === 'login') {
        await login(email, password);
        router.replace('/');
      } else {
        const signedIn = await signUp(name, email, password);
        if (signedIn) router.replace('/');
        else setInfo('Bevestig je e-mailadres via de link in je mailbox en meld je daarna aan.');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      setError(
        message.includes('Invalid login')
          ? 'E-mailadres of wachtwoord klopt niet.'
          : message !== ''
            ? message
            : 'Er ging iets mis. Probeer opnieuw.',
      );
    }
  };

  return (
    <Screen padding="lg">
      <Stack gap="lg" justify="center" flex={1}>
        <Stack gap="sm">
          <View style={styles.logo}>
            <Icon name="location" size={30} color={colors.onAccent} />
          </View>
          <Text size="xxl" weight="bold" display>Waarbenje</Text>
          <Text color={colors.textMuted}>Vind je vrienden terug op festivals en evenementen.</Text>
        </Stack>

        {!isSupabaseConfigured && (
          <Text size="sm" color={colors.warning}>
            Supabase is nog niet ingesteld. Vul EXPO_PUBLIC_SUPABASE_URL en EXPO_PUBLIC_SUPABASE_ANON_KEY in (zie README).
          </Text>
        )}

        <Stack gap="md">
          {mode === 'signup' && (
            <InputField
              label="Je naam"
              value={name}
              onChangeText={setName}
              placeholder="Zoals je vrienden je kennen"
              autoCapitalize="words"
              testID="name-input"
            />
          )}
          <InputField
            label="E-mailadres"
            value={email}
            onChangeText={setEmail}
            placeholder="jij@voorbeeld.be"
            keyboardType="email-address"
            testID="email-input"
          />
          <InputField
            label="Wachtwoord"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onSubmitEditing={handleSubmit}
            testID="password-input"
            error={error !== '' ? error : undefined}
          />
          {info !== '' && <Text size="sm" color={colors.accent}>{info}</Text>}
        </Stack>

        <Stack gap="sm">
          <StyledButton
            label={mode === 'login' ? 'Aanmelden' : 'Account maken'}
            onPress={handleSubmit}
            isLoading={isLoading}
            testID="login-button"
          />
          <StyledButton
            label={mode === 'login' ? 'Nog geen account? Registreer' : 'Ik heb al een account'}
            onPress={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
              setInfo('');
            }}
            variant="ghost"
            testID="toggle-mode"
          />
        </Stack>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
});
