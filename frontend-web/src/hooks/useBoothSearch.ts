import { useEffect, useState } from 'react';
import { searchBooths } from '../api/booths';
import type { BoothSearchResult } from '../types/booth';

const DEBOUNCE_MS = 300;

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Search failed.';
}

export function useBoothSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BoothSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed === '') {
      return;
    }

    let cancelled = false;
    // Starting the debounced search is the point of this effect; the loading flag is
    // part of that same synchronization, not a derivable render-time value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      searchBooths(trimmed)
        .then((data) => {
          if (!cancelled) {
            setResults(data);
            setLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setError(toMessage(err));
            setLoading(false);
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed]);

  if (trimmed === '') {
    return { query, setQuery, results: [], loading: false, error: null };
  }

  return { query, setQuery, results, loading, error };
}
