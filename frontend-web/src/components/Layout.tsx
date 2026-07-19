import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BoothDetailPanel } from './BoothDetailPanel';
import { useBoothSearch } from '../hooks/useBoothSearch';
import { useBooth } from '../hooks/useBooth';
import styles from './Layout.module.css';

export function Layout() {
  const [activeBoothId, setActiveBoothId] = useState<string | null>(null);
  const search = useBoothSearch();
  const activeBooth = useBooth(activeBoothId);

  return (
    <div className={styles.shell}>
      <Sidebar
        searchQuery={search.query}
        onSearchQueryChange={(value) => {
          search.setQuery(value);
          setActiveBoothId(null);
        }}
        searchResults={search.results}
        searchLoading={search.loading}
        searchError={search.error}
        activeBoothId={activeBoothId}
        onSelectBooth={setActiveBoothId}
      />

      <main className={styles.main}>
        <Outlet />
      </main>

      {activeBoothId && (
        <div className={styles.drawerBackdrop} onClick={() => setActiveBoothId(null)}>
          <div className={styles.drawer} onClick={(event) => event.stopPropagation()}>
            <BoothDetailPanel
              booth={activeBooth.data}
              loading={activeBooth.loading}
              error={activeBooth.error}
              onClose={() => setActiveBoothId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
