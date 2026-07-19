import type { BoothSearchResult } from '../types/booth';
import { EmptyState } from './EmptyState';
import styles from './BoothSearchResults.module.css';

interface BoothSearchResultsProps {
  results: BoothSearchResult[];
  query: string;
  selectedBoothId: string | null;
  onSelect: (boothId: string) => void;
}

export function BoothSearchResults({ results, query, selectedBoothId, onSelect }: BoothSearchResultsProps) {
  if (query.trim() === '') {
    return null;
  }

  if (results.length === 0) {
    return <EmptyState message={`No booths match "${query}".`} />;
  }

  return (
    <ul className={styles.list}>
      {results.map((booth) => (
        <li key={booth.id}>
          <button
            type="button"
            className={`${styles.item} ${booth.id === selectedBoothId ? styles.itemSelected : ''}`}
            onClick={() => onSelect(booth.id)}
            aria-pressed={booth.id === selectedBoothId}
          >
            <span className={styles.name}>{booth.name}</span>
            <span className={styles.meta}>
              Booth #{booth.number} · {booth.location} · {booth.constituency.name}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
