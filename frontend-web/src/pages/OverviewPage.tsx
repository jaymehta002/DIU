import { useOverview } from '../hooks/useOverview';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { StatTile } from '../components/StatTile';
import { CandidateLeaderboardChart } from '../components/CandidateLeaderboardChart';
import { ConstituencyComparisonChart } from '../components/ConstituencyComparisonChart';
import { formatNumber } from '../utils/format';
import styles from './OverviewPage.module.css';

export function OverviewPage() {
  const overview = useOverview();

  if (overview.loading) {
    return <LoadingState label="Loading overview…" />;
  }

  if (overview.error) {
    return <ErrorState message={overview.error} />;
  }

  if (!overview.data) {
    return null;
  }

  const { data } = overview;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>Results summary across all constituencies</p>
      </header>

      <div className={styles.statGrid}>
        <StatTile label="Constituencies" value={formatNumber(data.totalConstituencies)} />
        <StatTile label="Booths" value={formatNumber(data.totalBooths)} />
        <StatTile label="Votes cast" value={formatNumber(data.totalVotesCast)} />
        <StatTile label="Average turnout" value={`${data.averageTurnoutPercentage}%`} accent />
      </div>

      <div className={styles.chartGrid}>
        <CandidateLeaderboardChart candidates={data.topCandidates} />
        <ConstituencyComparisonChart constituencies={data.constituencies} />
      </div>
    </div>
  );
}
