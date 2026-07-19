import { useEffect, useState, type DependencyList } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const IDLE_STATE: AsyncState<never> = { data: null, loading: false, error: null };

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList,
  options?: { skip?: boolean },
): AsyncState<T> {
  const skip = options?.skip ?? false;
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: !skip, error: null });

  useEffect(() => {
    if (skip) {
      return;
    }

    let cancelled = false;
    // Kicking off the fetch is the point of this effect; the loading flag is part
    // of that same synchronization, not a derivable render-time value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ data: null, loading: true, error: null });

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ data: null, loading: false, error: toMessage(error) });
      });

    return () => {
      cancelled = true;
    };
    // deps is caller-controlled; fetcher is expected to be memoized against the same deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...deps]);

  if (skip) {
    return IDLE_STATE;
  }

  return state;
}
