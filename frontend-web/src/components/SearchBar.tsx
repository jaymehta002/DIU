import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      type="search"
      className={styles.input}
      placeholder="Search booths by name or number across all constituencies…"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Search booths"
    />
  );
}
