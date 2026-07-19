import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { VoteBreakdown } from '../components/VoteBreakdown';
import { useBoothDetail } from '../hooks/useBoothDetail';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BoothDetail'>;

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
            <Text style={styles.statValue}>{booth.registeredVoters.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Registered Voters</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{booth.totalVotesCast.toLocaleString()}</Text>
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
    backgroundColor: '#f5f6f8',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f6f8',
  },
  errorWrapper: {
    padding: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1d21',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b6c76',
  },
  location: {
    fontSize: 13,
    color: '#9a9aa5',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e1e6',
    padding: 16,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1d21',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b6c76',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1d21',
  },
});
