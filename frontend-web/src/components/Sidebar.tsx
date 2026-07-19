import { NavLink } from 'react-router-dom';
import type { BoothSearchResult } from '../types/booth';
import { SearchBar } from './SearchBar';
import { BoothSearchResults } from './BoothSearchResults';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { useConstituencies } from '../hooks/useConstituencies';
import { useAuth } from '../auth';
import styles from './Sidebar.module.css';

interface SidebarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: BoothSearchResult[];
  searchLoading: boolean;
  searchError: string | null;
  activeBoothId: string | null;
  onSelectBooth: (boothId: string) => void;
}

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;
}

export function Sidebar({
  searchQuery,
  onSearchQueryChange,
  searchResults,
  searchLoading,
  searchError,
  activeBoothId,
  onSelectBooth,
}: SidebarProps) {
  const constituencies = useConstituencies();
  const { user, logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>EC</span>
        <div>
          <p className={styles.brandTitle}>Election Dashboard</p>
          <p className={styles.brandSubtitle}>Analytics &amp; results</p>
        </div>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/" end className={navLinkClassName}>
          Overview
        </NavLink>
      </nav>

      <div className={styles.searchBlock}>
        <p className={styles.blockLabel}>Search booths</p>
        <SearchBar value={searchQuery} onChange={onSearchQueryChange} />
        <div className={styles.searchResults}>
          {searchLoading && <LoadingState label="Searching…" />}
          {searchError && <ErrorState message={searchError} />}
          {!searchLoading && !searchError && (
            <BoothSearchResults
              results={searchResults}
              query={searchQuery}
              selectedBoothId={activeBoothId}
              onSelect={onSelectBooth}
            />
          )}
        </div>
      </div>

      <div className={styles.constituencyBlock}>
        <p className={styles.blockLabel}>Constituencies</p>
        {constituencies.loading && <LoadingState label="Loading…" />}
        {constituencies.error && <ErrorState message={constituencies.error} />}
        <ul className={styles.constituencyList}>
          {constituencies.data?.map((constituency) => (
            <li key={constituency.id}>
              <NavLink to={`/constituency/${constituency.id}`} className={navLinkClassName}>
                {constituency.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.userBlock}>
        {user && <span className={styles.username}>{user.username}</span>}
        <button type="button" className={styles.logoutButton} onClick={() => void logout()}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
