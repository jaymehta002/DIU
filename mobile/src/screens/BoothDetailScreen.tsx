import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { VoteBreakdown } from '../components/VoteBreakdown';
import { useBoothDetail } from '../hooks/useBoothDetail';
import type { AppStackParamList } from '../navigation/types';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';
import { formatNumber } from '../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'BoothDetail'>;

export function BoothDetailScreen({ route }: Props) {
  const { boothId } = route.params;
  const { data: booth, loading, error } = useBoothDetail(boothId);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom', 'left', 'right']}>
        <LoadingState label="Loading booth…" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom', 'left', 'right']}>
        <View style={styles.errorWrapper}>
          <ErrorState message={error} />
        </View>
      </SafeAreaView>
    );
  }

  if (!booth) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{booth.name}</Text>
          <Text style={styles.subtitle}>
            Booth #{booth.number} · {booth.constituency.name}
          </Text>
          <Text style={styles.location}>{booth.location}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatNumber(booth.registeredVoters)}</Text>
            <Text style={styles.statLabel}>Registered Voters</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatNumber(booth.totalVotesCast)}</Text>
            <Text style={styles.statLabel}>Votes Cast</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{booth.turnoutPercentage}%</Text>
            <Text style={styles.statLabel}>Turnout</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Candidate Votes</Text>
        <VoteBreakdown booth={booth} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  errorWrapper: {
    padding: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  stat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
});
