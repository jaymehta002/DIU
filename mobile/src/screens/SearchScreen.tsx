import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchBar } from '../components/SearchBar';
import { BoothListItem } from '../components/BoothListItem';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { useBoothSearch } from '../hooks/useBoothSearch';
import type { AppStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Search'>;

export function SearchScreen({ navigation }: Props) {
  const { query, setQuery, results, loading, error } = useBoothSearch();
  const hasQuery = query.trim() !== '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        <SearchBar value={query} onChange={setQuery} />

        {loading && <LoadingState label="Searching…" />}
        {error && <ErrorState message={error} />}

        {!loading && !error && hasQuery && results.length === 0 && (
          <EmptyState message={`No booths match "${query}".`} />
        )}

        {!loading && !error && !hasQuery && (
          <EmptyState message="Search for a booth by name or number to get started." />
        )}

        {!loading && !error && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <BoothListItem
                booth={item}
                onPress={() => navigation.navigate('BoothDetail', { boothId: item.id })}
              />
            )}
          />
        )}
      </View>
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
});
