import styles from './StatTile.module.css';

interface StatTileProps {
  label: string;
  value: string;
  accent?: boolean;
}

export function StatTile({ label, value, accent = false }: StatTileProps) {
  return (
    <div className={styles.tile}>
      <span className={`${styles.value} ${accent ? styles.accent : ''}`}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
