import { Navigate, useParams } from 'react-router-dom';
import { useConstituencyBooths } from '../hooks/useConstituencyBooths';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { CandidateVotesChart } from '../components/CandidateVotesChart';
import { TurnoutHistogram } from '../components/TurnoutHistogram';
import { BoothTable } from '../components/BoothTable';
import styles from './ConstituencyDetailPage.module.css';

export function ConstituencyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const constituencyBooths = useConstituencyBooths(id ?? null);

  if (!id) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.page}>
      {constituencyBooths.loading && <LoadingState label="Loading constituency…" />}
      {constituencyBooths.error && <ErrorState message={constituencyBooths.error} />}

      {constituencyBooths.data && (
        <>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>{constituencyBooths.data.constituency.name}</h1>
              <p className={styles.subtitle}>Constituency-level results</p>
            </div>
            <span className={styles.code}>{constituencyBooths.data.constituency.code}</span>
          </header>

          {constituencyBooths.data.booths.length === 0 ? (
            <EmptyState message="This constituency has no booths." />
          ) : (
            <>
              <div className={styles.chartGrid}>
                <CandidateVotesChart booths={constituencyBooths.data.booths} />
                <TurnoutHistogram booths={constituencyBooths.data.booths} />
              </div>

              <section className={styles.tableSection}>
                <h2 className={styles.sectionTitle}>Booths</h2>
                <BoothTable booths={constituencyBooths.data.booths} />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
