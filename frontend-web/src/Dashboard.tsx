import { useState } from 'react';
import { ConstituencySelector } from './components/ConstituencySelector';
import { BoothTable } from './components/BoothTable';
import { CandidateVotesChart } from './components/CandidateVotesChart';
import { SearchBar } from './components/SearchBar';
import { BoothSearchResults } from './components/BoothSearchResults';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { EmptyState } from './components/EmptyState';
import { useConstituencies } from './hooks/useConstituencies';
import { useConstituencyBooths } from './hooks/useConstituencyBooths';
import { useBoothSearch } from './hooks/useBoothSearch';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const [selectedConstituencyId, setSelectedConstituencyId] = useState<string | null>(null);
  const constituencies = useConstituencies();
  const constituencyBooths = useConstituencyBooths(selectedConstituencyId);
  const search = useBoothSearch();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Election Dashboard</h1>
        <p className={styles.subtitle}>Constituency and booth-level results</p>
      </header>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Search booths</h2>
        <SearchBar value={search.query} onChange={search.setQuery} />
        {search.loading && <LoadingState label="Searching…" />}
        {search.error && <ErrorState message={search.error} />}
        {!search.loading && !search.error && <BoothSearchResults results={search.results} query={search.query} />}
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Browse by constituency</h2>

        {constituencies.loading && <LoadingState label="Loading constituencies…" />}
        {constituencies.error && <ErrorState message={constituencies.error} />}
        {constituencies.data && constituencies.data.length === 0 && (
          <EmptyState message="No constituencies found." />
        )}

        {constituencies.data && constituencies.data.length > 0 && (
          <ConstituencySelector
            constituencies={constituencies.data}
            selectedId={selectedConstituencyId}
            onSelect={setSelectedConstituencyId}
          />
        )}

        {selectedConstituencyId && constituencyBooths.loading && <LoadingState label="Loading booths…" />}
        {selectedConstituencyId && constituencyBooths.error && <ErrorState message={constituencyBooths.error} />}

        {constituencyBooths.data && (
          <div className={styles.constituencyContent}>
            <div className={styles.constituencyMeta}>
              <h3>{constituencyBooths.data.constituency.name}</h3>
              <span className={styles.code}>{constituencyBooths.data.constituency.code}</span>
            </div>

            <CandidateVotesChart booths={constituencyBooths.data.booths} />
            <BoothTable booths={constituencyBooths.data.booths} />
          </div>
        )}
      </section>
    </div>
  );
}
