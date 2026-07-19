import { StyleSheet, TextInput } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder="Search booths by name or number…"
      placeholderTextColor={colors.textMuted}
      autoCapitalize="none"
      autoCorrect={false}
      clearButtonMode="while-editing"
      accessibilityLabel="Search booths"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    backgroundColor: colors.surface,
    color: colors.text,
  },
});
