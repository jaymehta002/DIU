import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';
import type { Booth } from '../types/booth';
import type { Party } from '../types/party';
import { EmptyState } from './EmptyState';
import { ChartLegend } from './ChartLegend';
import { CHART_ACCENT, CHART_AXIS, CHART_GRID, CHART_NEUTRAL } from './chartTheme';
import { partyLabel } from '../utils/party';
import { formatNumber } from '../utils/format';
import styles from './ChartCard.module.css';
import tooltipStyles from './ChartTooltip.module.css';

interface CandidateVotesChartProps {
  booths: Booth[];
}

interface CandidateTotal {
  name: string;
  party: Party | null;
  votes: number;
}

const TOP_N = 8;

const LEGEND_ITEMS = [
  { label: 'Leading candidate', color: CHART_ACCENT },
  { label: 'Other candidates', color: CHART_NEUTRAL },
];

function VotesTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload as CandidateTotal | undefined;
  if (!entry) return null;

  return (
    <div className={tooltipStyles.tooltip}>
      <p className={tooltipStyles.label}>
        {entry.name} — {partyLabel(entry.party)}
      </p>
      <p className={tooltipStyles.value}>{formatNumber(entry.votes)} votes</p>
    </div>
  );
}

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

  const leaderVotes = totals[0].votes;

  return (
    <div className={styles.wrapper}>
      <h4 className={styles.title}>Votes by candidate</h4>
      <ChartLegend items={LEGEND_ITEMS} />
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={totals} margin={{ top: 8, right: 16, left: 8, bottom: 68 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID} />
          <XAxis
            dataKey="name"
            angle={-30}
            textAnchor="end"
            interval={0}
            height={80}
            tick={{ fontSize: 12, fill: CHART_AXIS }}
            label={{ value: 'Candidate', position: 'insideBottom', offset: -4, fill: CHART_AXIS }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: CHART_AXIS }}
            label={{ value: 'Votes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: CHART_AXIS } }}
          />
          <Tooltip content={VotesTooltip} cursor={{ fill: 'var(--surface-alt)' }} />
          <Bar dataKey="votes" name="Votes" radius={[4, 4, 0, 0]}>
            {totals.map((entry) => (
              <Cell key={entry.name} fill={entry.votes === leaderVotes ? CHART_ACCENT : CHART_NEUTRAL} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
