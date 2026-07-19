import { useMemo, useState } from 'react';
import type { Booth } from '../types/booth';
import { EmptyState } from './EmptyState';
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

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' },
    );
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
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
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
              {sorted.map((booth) => (
                <tr key={booth.id}>
                  <td>{booth.number}</td>
                  <td>{booth.name}</td>
                  <td>{booth.location}</td>
                  <td>{booth.registeredVoters.toLocaleString()}</td>
                  <td>{booth.totalVotesCast.toLocaleString()}</td>
                  <td>{booth.turnoutPercentage}%</td>
                  <td>
                    {booth.leadingCandidate.name} ({booth.leadingCandidate.party}) —{' '}
                    {booth.leadingCandidate.votes.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
