import { TextInput, View, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../../theme';
import { Text } from './Text';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  testID?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  onSubmitEditing?: () => void;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  testID,
  autoCapitalize = 'none',
  keyboardType = 'default',
  onSubmitEditing,
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <Text size="sm" weight="medium" color="#C4C8D0">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8F95A3"
        secureTextEntry={secureTextEntry}
        style={[styles.input, error !== undefined && styles.inputError]}
        testID={testID}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel={label}
      />
      {error !== undefined && <Text size="sm" color={colors.danger}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: radius.md - 2,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.body,
  },
  inputError: { borderColor: colors.danger },
});
