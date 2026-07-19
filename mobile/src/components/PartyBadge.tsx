import { StyleSheet, Text, View } from 'react-native';
import type { Party } from '../types/party';
import { colors, fontSize, fontWeight, letterSpacing, radius, spacing } from '../theme';
import { hexToRgba } from '../utils/color';

interface PartyBadgeProps {
  party: Party | null;
}

export function PartyBadge({ party }: PartyBadgeProps) {
  if (!party) {
    return (
      <View style={[styles.badge, styles.independentBadge]}>
        <Text style={styles.independentText}>Independent</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: hexToRgba(party.color, 0.12), borderColor: party.color }]}>
      <Text style={[styles.symbol, { color: party.color }]}>{party.symbol}</Text>
      <Text style={[styles.name, { color: party.color }]}>{party.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  symbol: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wide,
  },
  name: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  independentBadge: {
    backgroundColor: colors.independentBg,
    borderColor: colors.independentBorder,
  },
  independentText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.independentText,
  },
});
