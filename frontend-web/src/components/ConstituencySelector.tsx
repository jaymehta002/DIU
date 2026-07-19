import type { ConstituencySummary } from '../types/constituency';
import styles from './ConstituencySelector.module.css';

interface ConstituencySelectorProps {
  constituencies: ConstituencySummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConstituencySelector({ constituencies, selectedId, onSelect }: ConstituencySelectorProps) {
  return (
    <div className={styles.wrapper}>
      <label htmlFor="constituency-select" className={styles.label}>
        Constituency
      </label>
      <select
        id="constituency-select"
        className={styles.select}
        value={selectedId ?? ''}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="" disabled>
          Select a constituency
        </option>
        {constituencies.map((constituency) => (
          <option key={constituency.id} value={constituency.id}>
            {constituency.name}
          </option>
        ))}
      </select>
    </div>
  );
}
