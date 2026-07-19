import { useCallback } from 'react';
import { useAsync } from './useAsync';
import { fetchConstituencyBooths } from '../api/constituencies';

export function useConstituencyBooths(constituencyId: string | null) {
  const fetcher = useCallback(() => fetchConstituencyBooths(constituencyId as string), [constituencyId]);
  return useAsync(fetcher, [constituencyId], { skip: constituencyId === null });
}
