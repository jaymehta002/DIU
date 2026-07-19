import { Pressable, StyleSheet, Text } from 'react-native';
import type { BoothSearchResult } from '../types/booth';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';

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
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
