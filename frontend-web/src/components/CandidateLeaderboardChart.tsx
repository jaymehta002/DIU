import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';
import type { CandidateLeaderboardEntry } from '../types/overview';
import { EmptyState } from './EmptyState';
import { ChartLegend } from './ChartLegend';
import { CHART_ACCENT, CHART_AXIS, CHART_GRID, CHART_NEUTRAL } from './chartTheme';
import { partyLabel } from '../utils/party';
import { formatNumber } from '../utils/format';
import styles from './ChartCard.module.css';
import tooltipStyles from './ChartTooltip.module.css';

interface CandidateLeaderboardChartProps {
  candidates: CandidateLeaderboardEntry[];
}

const LEGEND_ITEMS = [
  { label: 'National leader', color: CHART_ACCENT },
  { label: 'Other top candidates', color: CHART_NEUTRAL },
];

function LeaderboardTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload as CandidateLeaderboardEntry | undefined;
  if (!entry) return null;

  return (
    <div className={tooltipStyles.tooltip}>
      <p className={tooltipStyles.label}>
        {entry.name} — {partyLabel(entry.party)}
      </p>
      <p className={tooltipStyles.value}>{entry.constituency.name}</p>
      <p className={tooltipStyles.value}>{formatNumber(entry.totalVotes)} votes</p>
    </div>
  );
}

export function CandidateLeaderboardChart({ candidates }: CandidateLeaderboardChartProps) {
  if (candidates.length === 0) {
    return <EmptyState message="No candidate data available." />;
  }

  const topVotes = candidates[0].totalVotes;
  const data = [...candidates].reverse();

  return (
    <div className={styles.wrapper}>
      <h4 className={styles.title}>Top candidates by total votes</h4>
      <ChartLegend items={LEGEND_ITEMS} />
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART_GRID} />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: CHART_AXIS }}
            label={{ value: 'Total votes', position: 'insideBottom', offset: -18, fill: CHART_AXIS }}
          />
          <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12, fill: CHART_AXIS }} />
          <Tooltip content={LeaderboardTooltip} cursor={{ fill: 'var(--surface-alt)' }} />
          <Bar dataKey="totalVotes" name="Total votes" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.id} fill={entry.totalVotes === topVotes ? CHART_ACCENT : CHART_NEUTRAL} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
