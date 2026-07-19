import { Fragment, useMemo, useState } from 'react';
import type { Booth } from '../types/booth';
import { CandidateRanking } from './CandidateRanking';
import { EmptyState } from './EmptyState';
import { partyLabel } from '../utils/party';
import { formatNumber } from '../utils/format';
import styles from './BoothTable.module.css';

interface BoothTableProps {
  booths: Booth[];
}

type SortKey =
  | 'number'
  | 'name'
  | 'location'
  | 'registeredVoters'
  | 'totalVotesCast'
  | 'turnoutPercentage'
  | 'leadingCandidate';

type SortDirection = 'asc' | 'desc';

interface SortState {
  key: SortKey;
  direction: SortDirection;
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'number', label: '#' },
  { key: 'name', label: 'Booth' },
  { key: 'location', label: 'Location' },
  { key: 'registeredVoters', label: 'Registered' },
  { key: 'totalVotesCast', label: 'Votes Cast' },
  { key: 'turnoutPercentage', label: 'Turnout %' },
  { key: 'leadingCandidate', label: 'Leading Candidate' },
];

const TOTAL_COLUMN_COUNT = COLUMNS.length + 1; // + the expand-toggle column
const PAGE_SIZE = 15;

function getSortValue(booth: Booth, key: SortKey): string | number {
  switch (key) {
    case 'number':
      return booth.number;
    case 'name':
      return booth.name;
    case 'location':
      return booth.location;
    case 'registeredVoters':
      return booth.registeredVoters;
    case 'totalVotesCast':
      return booth.totalVotesCast;
    case 'turnoutPercentage':
      return booth.turnoutPercentage;
    case 'leadingCandidate':
      return booth.leadingCandidate.votes;
  }
}

export function BoothTable({ booths }: BoothTableProps) {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<SortState>({ key: 'number', direction: 'asc' });
  const [expandedBoothId, setExpandedBoothId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (term === '') return booths;
    return booths.filter(
      (booth) =>
        booth.name.toLowerCase().includes(term) ||
        booth.location.toLowerCase().includes(term) ||
        booth.leadingCandidate.name.toLowerCase().includes(term) ||
        String(booth.number).includes(term),
    );
  }, [booths, filter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const aValue = getSortValue(a, sort.key);
      const bValue = getSortValue(b, sort.key);
      const comparison =
        typeof aValue === 'number' && typeof bValue === 'number'
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue));
      return sort.direction === 'asc' ? comparison : -comparison;
    });
    return copy;
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  const resetKey = `${filter}|${sort.key}|${sort.direction}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setPage(1);
  }

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' },
    );
  }

  function toggleExpanded(boothId: string) {
    setExpandedBoothId((prev) => (prev === boothId ? null : boothId));
  }

  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        className={styles.filterInput}
        placeholder="Filter booths by name, location, or leading candidate…"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        aria-label="Filter booths"
      />

      {sorted.length === 0 ? (
        <EmptyState
          message={booths.length === 0 ? 'This constituency has no booths.' : 'No booths match your filter.'}
        />
      ) : (
        <>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <colgroup>
                <col className={styles.colExpand} />
                <col className={styles.colNumber} />
                <col className={styles.colName} />
                <col className={styles.colLocation} />
                <col className={styles.colNumeric} />
                <col className={styles.colNumeric} />
                <col className={styles.colNumeric} />
                <col className={styles.colLeading} />
              </colgroup>
              <thead>
                <tr>
                  <th aria-hidden="true" />
                  {COLUMNS.map((column) => (
                    <th key={column.key}>
                      <button type="button" className={styles.sortButton} onClick={() => toggleSort(column.key)}>
                        {column.label}
                        {sort.key === column.key ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((booth) => {
                  const isExpanded = expandedBoothId === booth.id;

                  return (
                    <Fragment key={booth.id}>
                      <tr
                        className={styles.row}
                        onClick={() => toggleExpanded(booth.id)}
                        aria-expanded={isExpanded}
                      >
                        <td className={styles.expandCell}>
                          <button
                            type="button"
                            className={styles.expandButton}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleExpanded(booth.id);
                            }}
                            aria-label={isExpanded ? 'Collapse candidate breakdown' : 'Expand candidate breakdown'}
                          >
                            {isExpanded ? '▾' : '▸'}
                          </button>
                        </td>
                        <td className={styles.numeric}>{booth.number}</td>
                        <td className={styles.nameCell} title={booth.name}>
                          {booth.name}
                        </td>
                        <td className={styles.locationCell} title={booth.location}>
                          {booth.location}
                        </td>
                        <td className={styles.numeric}>{formatNumber(booth.registeredVoters)}</td>
                        <td className={styles.numeric}>{formatNumber(booth.totalVotesCast)}</td>
                        <td className={styles.numeric}>{booth.turnoutPercentage}%</td>
                        <td className={styles.leadingCell} title={partyLabel(booth.leadingCandidate.party)}>
                          <span className={styles.leadingBadge}>{booth.leadingCandidate.name}</span>
                          <span className={styles.leadingVotes}>{formatNumber(booth.leadingCandidate.votes)}</span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className={styles.detailRow}>
                          <td colSpan={TOTAL_COLUMN_COUNT}>
                            <CandidateRanking candidates={booth.candidates} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className={styles.pageStatus}>
                Page {page} of {pageCount} · {sorted.length} booths
              </span>
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
