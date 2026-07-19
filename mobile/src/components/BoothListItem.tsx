import { Pressable, StyleSheet, Text } from 'react-native';
import type { BoothSearchResult } from '../types/booth';

interface BoothListItemProps {
  booth: BoothSearchResult;
  onPress: () => void;
}

export function BoothListItem({ booth, onPress }: BoothListItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.name}>{booth.name}</Text>
      <Text style={styles.meta}>
        Booth #{booth.number} · {booth.location} · {booth.constituency.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e1e6',
    backgroundColor: '#ffffff',
    gap: 4,
  },
  pressed: {
    backgroundColor: '#f0f1f4',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1d21',
  },
  meta: {
    fontSize: 13,
    color: '#6b6c76',
  },
});
