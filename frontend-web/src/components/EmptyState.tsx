import styles from './StatusStates.module.css';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return <div className={`${styles.status} ${styles.empty}`}>{message}</div>;
}
