import { StyleSheet, Text, View } from 'react-native';
import type { Booth } from '../types/booth';

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
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>LEADING</Text>
                  </View>
                )}
              </View>
              <Text style={styles.party}>{candidate.party}</Text>
            </View>
            <Text style={[styles.votes, isLeading && styles.leadingText]}>
              {candidate.votes.toLocaleString()}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e1e6',
    backgroundColor: '#ffffff',
  },
  leadingRow: {
    borderColor: '#3457d5',
    backgroundColor: '#eef1fc',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1d21',
  },
  leadingText: {
    color: '#3457d5',
  },
  party: {
    fontSize: 13,
    color: '#6b6c76',
  },
  votes: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1d21',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#3457d5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});
