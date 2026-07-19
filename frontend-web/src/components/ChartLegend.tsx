import styles from './ChartLegend.module.css';

export interface ChartLegendItem {
  label: string;
  color: string;
  shape?: 'square' | 'line';
}

interface ChartLegendProps {
  items: ChartLegendItem[];
}

export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <ul className={styles.legend}>
      {items.map((item) => (
        <li key={item.label} className={styles.item}>
          {item.shape === 'line' ? (
            <span className={styles.swatchLine} style={{ borderColor: item.color }} />
          ) : (
            <span className={styles.swatchSquare} style={{ backgroundColor: item.color }} />
          )}
          {item.label}
        </li>
      ))}
    </ul>
  );
}
