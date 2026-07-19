import type { BoothDetail } from '../types/booth';
import { CandidateRanking } from './CandidateRanking';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import styles from './BoothDetailPanel.module.css';

interface BoothDetailPanelProps {
  booth: BoothDetail | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export function BoothDetailPanel({ booth, loading, error, onClose }: BoothDetailPanelProps) {
  return (
    <div className={styles.panel} role="region" aria-label="Booth detail">
      <div className={styles.header}>
        <h3 className={styles.title}>Booth detail</h3>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close booth detail">
          ✕
        </button>
      </div>

      {loading && <LoadingState label="Loading booth…" />}
      {error && <ErrorState message={error} />}

      {booth && (
        <div className={styles.content}>
          <div>
            <p className={styles.name}>{booth.name}</p>
            <p className={styles.meta}>
              Booth #{booth.number} · {booth.constituency.name} ({booth.constituency.code})
            </p>
            <p className={styles.meta}>{booth.location}</p>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{booth.registeredVoters.toLocaleString()}</span>
              <span className={styles.statLabel}>Registered</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{booth.totalVotesCast.toLocaleString()}</span>
              <span className={styles.statLabel}>Votes Cast</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{booth.turnoutPercentage}%</span>
              <span className={styles.statLabel}>Turnout</span>
            </div>
          </div>

          <div>
            <h4 className={styles.sectionTitle}>Candidate votes</h4>
            <CandidateRanking candidates={booth.candidates} />
          </div>
        </div>
      )}
    </div>
  );
}
