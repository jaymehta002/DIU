import type { BoothSearchResult } from '../types/booth';
import { EmptyState } from './EmptyState';
import styles from './BoothSearchResults.module.css';

interface BoothSearchResultsProps {
  results: BoothSearchResult[];
  query: string;
}

export function BoothSearchResults({ results, query }: BoothSearchResultsProps) {
  if (query.trim() === '') {
    return null;
  }

  if (results.length === 0) {
    return <EmptyState message={`No booths match "${query}".`} />;
  }

  return (
    <ul className={styles.list}>
      {results.map((booth) => (
        <li key={booth.id} className={styles.item}>
          <span className={styles.name}>{booth.name}</span>
          <span className={styles.meta}>
            Booth #{booth.number} · {booth.location} · {booth.constituency.name}
          </span>
        </li>
      ))}
    </ul>
  );
}
