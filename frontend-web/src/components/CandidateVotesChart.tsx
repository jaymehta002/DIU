import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Booth } from '../types/booth';
import { EmptyState } from './EmptyState';
import styles from './CandidateVotesChart.module.css';

interface CandidateVotesChartProps {
  booths: Booth[];
}

interface CandidateTotal {
  name: string;
  party: string;
  votes: number;
}

const TOP_N = 8;

export function CandidateVotesChart({ booths }: CandidateVotesChartProps) {
  const totals = useMemo(() => {
    const byCandidate = new Map<string, CandidateTotal>();

    for (const booth of booths) {
      for (const candidate of booth.candidates) {
        const existing = byCandidate.get(candidate.id);
        if (existing) {
          existing.votes += candidate.votes;
        } else {
          byCandidate.set(candidate.id, { name: candidate.name, party: candidate.party, votes: candidate.votes });
        }
      }
    }

    return Array.from(byCandidate.values())
      .sort((a, b) => b.votes - a.votes)
      .slice(0, TOP_N);
  }, [booths]);

  if (totals.length === 0) {
    return <EmptyState message="No candidate data available for this constituency." />;
  }

  return (
    <div className={styles.wrapper}>
      <h4 className={styles.title}>Total votes by candidate (top {TOP_N})</h4>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={totals} margin={{ top: 8, right: 16, left: 8, bottom: 56 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={80} tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'Votes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          />
          <Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Votes']} />
          <Bar dataKey="votes" name="Votes" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
