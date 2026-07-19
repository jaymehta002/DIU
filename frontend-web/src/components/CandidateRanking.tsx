import type { Candidate } from '../types/candidate';
import styles from './CandidateRanking.module.css';

interface CandidateRankingProps {
  candidates: Candidate[];
}

const RANK_LABELS = ['Leading', 'Runner-up', '3rd', '4th', '5th', '6th'];

function rankLabel(index: number): string {
  return RANK_LABELS[index] ?? `${index + 1}th`;
}

export function CandidateRanking({ candidates }: CandidateRankingProps) {
  const ranked = [...candidates].sort((a, b) => b.votes - a.votes);

  return (
    <ol className={styles.list}>
      {ranked.map((candidate, index) => (
        <li key={candidate.id} className={index === 0 ? styles.leading : styles.item}>
          <span className={styles.rank}>{rankLabel(index)}</span>
          <span className={styles.name}>
            {candidate.name} <span className={styles.party}>({candidate.party})</span>
          </span>
          <span className={styles.votes}>{candidate.votes.toLocaleString()}</span>
        </li>
      ))}
    </ol>
  );
}
