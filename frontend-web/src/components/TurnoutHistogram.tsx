import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import type { Booth } from '../types/booth';
import { EmptyState } from './EmptyState';
import { ChartLegend } from './ChartLegend';
import { CHART_ACCENT, CHART_AXIS, CHART_GRID, CHART_NEUTRAL } from './chartTheme';
import { formatNumber } from '../utils/format';
import styles from './ChartCard.module.css';
import tooltipStyles from './ChartTooltip.module.css';

interface TurnoutHistogramProps {
  booths: Booth[];
}

const LEGEND_ITEMS = [
  { label: 'Turnout per booth', color: CHART_NEUTRAL },
  { label: 'Constituency average', color: CHART_ACCENT, shape: 'line' as const },
];

function TurnoutTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload as Booth | undefined;
  if (!entry) return null;

  return (
    <div className={tooltipStyles.tooltip}>
      <p className={tooltipStyles.label}>
        Booth #{entry.number} — {entry.name}
      </p>
      <p className={tooltipStyles.value}>{entry.turnoutPercentage}% turnout</p>
      <p className={tooltipStyles.value}>
        {formatNumber(entry.totalVotesCast)} / {formatNumber(entry.registeredVoters)} votes
      </p>
    </div>
  );
}

export function TurnoutHistogram({ booths }: TurnoutHistogramProps) {
  const sorted = useMemo(
    () => [...booths].sort((a, b) => b.turnoutPercentage - a.turnoutPercentage),
    [booths],
  );

  const average = useMemo(() => {
    if (sorted.length === 0) return 0;
    const sum = sorted.reduce((acc, booth) => acc + booth.turnoutPercentage, 0);
    return Math.round((sum / sorted.length) * 10) / 10;
  }, [sorted]);

  if (sorted.length === 0) {
    return <EmptyState message="No booth data available for this constituency." />;
  }

  const tickInterval = Math.max(0, Math.ceil(sorted.length / 12) - 1);

  return (
    <div className={styles.wrapper}>
      <h4 className={styles.title}>Turnout distribution by booth</h4>
      <ChartLegend items={LEGEND_ITEMS} />
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={sorted} margin={{ top: 8, right: 16, left: 8, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID} />
          <XAxis
            dataKey="number"
            tick={{ fontSize: 11, fill: CHART_AXIS }}
            interval={tickInterval}
            label={{ value: 'Booth (sorted by turnout)', position: 'insideBottom', offset: -18, fill: CHART_AXIS }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: CHART_AXIS }}
            label={{ value: 'Turnout %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: CHART_AXIS } }}
          />
          <Tooltip content={TurnoutTooltip} cursor={{ fill: 'var(--surface-alt)' }} />
          <ReferenceLine y={average} stroke={CHART_ACCENT} strokeDasharray="4 4" strokeWidth={2} />
          <Bar dataKey="turnoutPercentage" name="Turnout %" fill={CHART_NEUTRAL} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
