import { StyleSheet, Text, View } from 'react-native';
import type { Booth } from '../types/booth';
import { PartyBadge } from './PartyBadge';
import { colors, fontSize, fontWeight, letterSpacing, radius, spacing } from '../theme';
import { formatNumber } from '../utils/format';

interface VoteBreakdownProps {
  booth: Booth;
}

export function VoteBreakdown({ booth }: VoteBreakdownProps) {
  const sorted = [...booth.candidates].sort((a, b) => b.votes - a.votes);

  return (
    <View style={styles.container}>
      {sorted.map((candidate) => {
        const isLeading = candidate.id === booth.leadingCandidate.id;
        return (
          <View key={candidate.id} style={[styles.row, isLeading && styles.leadingRow]}>
            <View style={styles.rowText}>
              <View style={styles.nameLine}>
                <Text style={[styles.name, isLeading && styles.leadingText]}>{candidate.name}</Text>
                {isLeading && (
                  <View style={styles.leadingTag}>
                    <Text style={styles.leadingTagText}>LEADING</Text>
                  </View>
                )}
              </View>
              <PartyBadge party={candidate.party} />
            </View>
            <Text style={[styles.votes, isLeading && styles.leadingText]}>{formatNumber(candidate.votes)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  leadingRow: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  leadingText: {
    color: colors.accent,
  },
  votes: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  leadingTag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
  },
  leadingTagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.onAccent,
    letterSpacing: letterSpacing.wide,
  },
});
