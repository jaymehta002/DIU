import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../auth';
import { colors, fontSize, fontWeight, spacing } from '../theme';

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <TouchableOpacity
      onPress={() => logout()}
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      style={styles.button}
    >
      <Text style={styles.label}>Sign out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
