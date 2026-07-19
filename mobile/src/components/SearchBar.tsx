import { StyleSheet, TextInput } from 'react-native';

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
      placeholderTextColor="#9a9aa5"
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
    borderColor: '#e0e1e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1c1d21',
  },
});
