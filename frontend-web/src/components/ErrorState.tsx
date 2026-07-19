import styles from './StatusStates.module.css';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className={`${styles.status} ${styles.error}`} role="alert">
      {message}
    </div>
  );
}
