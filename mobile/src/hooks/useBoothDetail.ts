import { useEffect, useState } from 'react';
import { fetchBoothById } from '../api/booths';
import type { BoothDetail } from '../types/booth';

interface BoothDetailState {
  data: BoothDetail | null;
  loading: boolean;
  error: string | null;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export function useBoothDetail(boothId: string) {
  const [state, setState] = useState<BoothDetailState>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    // Kicking off the fetch is the point of this effect; the loading flag is part
    // of that same synchronization, not a derivable render-time value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ data: null, loading: true, error: null });

    fetchBoothById(boothId)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ data: null, loading: false, error: toMessage(error) });
      });

    return () => {
      cancelled = true;
    };
  }, [boothId]);

  return state;
}
