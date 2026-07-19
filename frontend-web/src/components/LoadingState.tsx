import styles from './StatusStates.module.css';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <div className={styles.status} role="status">
      {label}
    </div>
  );
}
