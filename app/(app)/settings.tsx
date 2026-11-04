import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { goBack, IconButton } from '../../src/components/IconButton';
import { Avatar } from '../../src/components/primitives/Avatar';
import { Card } from '../../src/components/primitives/Card';
import { Icon } from '../../src/components/primitives/Icon';
import { Screen } from '../../src/components/primitives/Screen';
import { Stack } from '../../src/components/primitives/Stack';
import { Text } from '../../src/components/primitives/Text';
import { StyledButton } from '../../src/components/StyledButton';
import { stopSharing } from '../../src/services/groupService';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useGroupStore } from '../../src/state/useGroupStore';
import { useSettingsStore } from '../../src/state/useSettingsStore';
import { colors } from '../../src/theme';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const { autoShare, keepAwake, update } = useSettingsStore();
  const myMemberId = useGroupStore((s) => s.myMemberId);
  const [loggingOut, setLoggingOut] = useState(false);

  // Eerst je gedeelde locatie wissen, zodat je vrienden je niet meer zien na het afmelden.
  const handleLogout = async () => {
    setLoggingOut(true);
    if (myMemberId !== null) await stopSharing(myMemberId).catch(() => {});
    await logout();
    router.replace('/login');
  };

  return (
    <Screen padding="md">
      <Stack gap="lg">
        <View style={styles.top}>
          <IconButton icon="chevron-back" label="Terug" onPress={() => goBack('/')} testID="back-button" />
          <Text size="xl" weight="bold" display>Instellingen</Text>
        </View>

        <Card>
          <View style={styles.profile}>
            <Avatar name={user?.name} size="lg" />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text size="lg" weight="bold" display>{user?.name}</Text>
              <Text size="sm" color={colors.textMuted} numberOfLines={1}>{user?.email}</Text>
              <Text size="sm" color={colors.textMuted}>Zo zien je vrienden je in de groep.</Text>
            </View>
          </View>
        </Card>
        <StyledButton
          label="Afmelden"
          variant="secondary"
          icon="log-out-outline"
          onPress={() => void handleLogout()}
          isLoading={loggingOut}
          testID="logout-button"
        />

        <Stack gap="sm">
          <SectionTitle>Locatie</SectionTitle>
          <Card>
            <SettingRow
              icon="navigate-outline"
              title="Meteen delen op de kaart"
              description="Je locatie delen zodra je de kaart opent. Uit: je kiest telkens zelf."
              value={autoShare}
              onChange={(v) => update({ autoShare: v })}
              testID="setting-auto-share"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="sunny-outline"
              title="Scherm aan laten"
              description="Je scherm gaat niet uit zolang de kaart open is, handig tijdens het zoeken."
              value={keepAwake}
              onChange={(v) => update({ keepAwake: v })}
              testID="setting-keep-awake"
            />
          </Card>
          <Text size="sm" color={colors.textMuted}>
            Toegang tot je locatie geef of weiger je in de instellingen van je browser of gsm.
          </Text>
        </Stack>

        <Stack gap="sm">
          <SectionTitle>Privacy</SectionTitle>
          <Card>
            <Stack padding="md" gap="sm">
              <InfoLine icon="people-outline" text="Alleen leden van je groep zien je locatie." />
              <InfoLine icon="time-outline" text="Een nieuwe groep vervalt na 24 uur; daarna is niemands locatie nog zichtbaar." />
              <InfoLine icon="pause-outline" text="Pauzeren of de groep verlaten wist je gedeelde locatie meteen." />
            </Stack>
          </Card>
        </Stack>

        <Stack gap="sm">
          <SectionTitle>Over Waarbenje</SectionTitle>
          <Card>
            <Stack padding="md" gap="sm">
              <Text size="sm" color={colors.textMuted}>
                Vind je vrienden terug, waar je ook bent: in het park, op het strand of op een festival.
              </Text>
              <Text size="sm" color={colors.textMuted}>Versie {Constants.expoConfig?.version ?? '1.0.0'}</Text>
            </Stack>
          </Card>
        </Stack>

      </Stack>
    </Screen>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={{ paddingHorizontal: 4 }}>
      <Text size="sm" weight="medium" color="#C4C8D0">{children}</Text>
    </View>
  );
}

function SettingRow(props: {
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  testID?: string;
}) {
  return (
    <View style={styles.row}>
      <Icon name={props.icon} size={22} color={colors.accent} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text weight="medium">{props.title}</Text>
        <Text size="sm" color={colors.textMuted}>{props.description}</Text>
      </View>
      <Switch
        value={props.value}
        onValueChange={props.onChange}
        accessibilityLabel={props.title}
        testID={props.testID}
        trackColor={{ false: colors.borderStrong, true: colors.accent }}
        thumbColor={colors.text}
        // react-native-web gebruikt deze prop voor de kleur van het bolletje als de schakelaar aan staat
        {...({ activeThumbColor: colors.onAccent } as object)}
      />
    </View>
  );
}

function InfoLine({ icon, text }: { icon: React.ComponentProps<typeof Icon>['name']; text: string }) {
  return (
    <View style={styles.info}>
      <Icon name={icon} size={18} color={colors.textMuted} />
      <View style={{ flex: 1 }}>
        <Text size="sm">{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  info: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
});
