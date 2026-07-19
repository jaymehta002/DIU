import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';
import type { ConstituencyStat } from '../types/overview';
import { EmptyState } from './EmptyState';
import { ChartLegend } from './ChartLegend';
import { CHART_ACCENT, CHART_AXIS, CHART_GRID, CHART_NEUTRAL } from './chartTheme';
import { formatNumber } from '../utils/format';
import styles from './ChartCard.module.css';
import tooltipStyles from './ChartTooltip.module.css';

interface ConstituencyComparisonChartProps {
  constituencies: ConstituencyStat[];
}

const LEGEND_ITEMS = [
  { label: 'Highest turnout', color: CHART_ACCENT },
  { label: 'Other constituencies', color: CHART_NEUTRAL },
];

function ComparisonTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload as ConstituencyStat | undefined;
  if (!entry) return null;

  return (
    <div className={tooltipStyles.tooltip}>
      <p className={tooltipStyles.label}>
        {entry.name} ({entry.code})
      </p>
      <p className={tooltipStyles.value}>{entry.turnoutPercentage}% turnout</p>
      <p className={tooltipStyles.value}>
        {formatNumber(entry.votesCast)} / {formatNumber(entry.registeredVoters)} votes · {entry.boothCount} booths
      </p>
    </div>
  );
}

export function ConstituencyComparisonChart({ constituencies }: ConstituencyComparisonChartProps) {
  const navigate = useNavigate();
  const sorted = useMemo(
    () => [...constituencies].sort((a, b) => b.turnoutPercentage - a.turnoutPercentage),
    [constituencies],
  );

  if (sorted.length === 0) {
    return <EmptyState message="No constituency data available." />;
  }

  const topTurnout = sorted[0].turnoutPercentage;

  return (
    <div className={styles.wrapper}>
      <h4 className={styles.title}>Turnout by constituency</h4>
      <ChartLegend items={LEGEND_ITEMS} />
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={sorted} margin={{ top: 8, right: 16, left: 8, bottom: 68 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID} />
          <XAxis
            dataKey="name"
            angle={-30}
            textAnchor="end"
            interval={0}
            height={80}
            tick={{ fontSize: 12, fill: CHART_AXIS }}
            label={{ value: 'Constituency', position: 'insideBottom', offset: -4, fill: CHART_AXIS }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: CHART_AXIS }}
            label={{ value: 'Turnout %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: CHART_AXIS } }}
          />
          <Tooltip content={ComparisonTooltip} cursor={{ fill: 'var(--surface-alt)' }} />
          <Bar
            dataKey="turnoutPercentage"
            name="Turnout %"
            radius={[4, 4, 0, 0]}
            cursor="pointer"
            onClick={(entry) => navigate(`/constituency/${(entry as unknown as ConstituencyStat).id}`)}
          >
            {sorted.map((entry) => (
              <Cell key={entry.id} fill={entry.turnoutPercentage === topTurnout ? CHART_ACCENT : CHART_NEUTRAL} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
