import React, { useEffect, useMemo, useRef, useState } from 'react';
import Spinner from './components/Spinner/Spinner';
import { USE_MOCK_DATA, mockFetchLaunches } from './mockLaunchData';
import './App.css';

const PAGE_SIZE = 10;

function App() {
  const [launches, setLaunches] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchLaunches = async () => {
      setLoading(true);
      setError('');

      try {
        let data = [];

        if (USE_MOCK_DATA) {
          data = await mockFetchLaunches();
        } else {
          const response = await fetch('https://ll.thespacedevs.com/2.3.0/launches/?search=Starlink');
          // const response = await fetch('https://api.spacexdata.com/v3/launches');

          if (!response.ok) {
            throw new Error('Unable to fetch launches');
          }

          data = await response.results.json();
        }

        setLaunches(data || []);
        setPage(1);
      } catch (err) {
        setError('Unable to load launches right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLaunches();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredLaunches = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return launches;
    }

    return launches.filter((launch) => {
      const searchableText = [
        launch.mission_name,
        launch.launch_year,
        launch.details,
        launch.flight_number ? String(launch.flight_number) : ''
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(searchText);
    });
  }, [launches, search]);

  const visibleLaunches = useMemo(
    () => filteredLaunches.slice(0, page * PAGE_SIZE),
    [filteredLaunches, page]
  );

  const hasMore = visibleLaunches.length < filteredLaunches.length;

  const handleScroll = () => {
    const container = scrollRef.current;

    if (!container || !hasMore || loadingMore) {
      return;
    }

    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 40;

    if (nearBottom) {
      setLoadingMore(true);
      setPage((currentPage) => currentPage + 1);
    }
  };

  useEffect(() => {
    if (loadingMore) {
      setLoadingMore(false);
    }
  }, [page]);

  const renderStatus = (isSuccessful) => {
    if (isSuccessful === true) {
      return 'Success';
    }

    if (isSuccessful === false) {
      return 'Failed';
    }

    return 'Unknown';
  };

  const renderStatusClass = (isSuccessful) => {
    if (isSuccessful === true) {
      return 'launch__status launch__status--success';
    }

    if (isSuccessful === false) {
      return 'launch__status launch__status--danger';
    }

    return 'launch__status launch__status--warning';
  };

  return (
    <div className="App">
      <div className="main__wrapper container">
        <h2>SpaceX Launches</h2>

        <div className="search">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search launches"
            aria-label="Search launches"
          />
        </div>

        {error ? (
          <div className="no-content">{error}</div>
        ) : (
          <div className="launch__wrapper" ref={scrollRef} onScroll={handleScroll}>
            {loading ? (
              <div className="launch__loading">
                <Spinner />
              </div>
            ) : visibleLaunches.length > 0 ? (
              <div className="launch__list">
                {visibleLaunches.map((launch) => (
                  <article key={launch.flight_number} className="launch__item">
                    <div className="launch__meta">
                      <span className="launch__meta-item">#{launch.flight_number}</span>
                      <span className="launch__meta-item">{launch.launch_year}</span>
                      <span className={renderStatusClass(launch.launch_success)}>
                        {renderStatus(launch.launch_success)}
                      </span>
                    </div>

                    <div className="media">
                      <div className="launch__image">
                        {launch.links && launch.links.mission_patch_small ? (
                          <img src={launch.links.mission_patch_small} alt={launch.mission_name} />
                        ) : (
                          <div className="fallback-image">No image</div>
                        )}
                      </div>

                      <div className="launch__body">
                        <h3>{launch.mission_name}</h3>
                        <p>{launch.details || 'No mission details available.'}</p>

                        <div className="launch__details">
                          <div className="launch__meta">
                            <span className="launch__meta-item">
                              {launch.launch_site && launch.launch_site.site_name_long
                                ? launch.launch_site.site_name_long
                                : 'Launch site unavailable'}
                            </span>
                          </div>
                          <div className="launch__meta">
                            <span className="launch__meta-item">
                              {launch.launch_date_utc
                                ? new Date(launch.launch_date_utc).toLocaleDateString()
                                : 'Date unavailable'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                {loadingMore && (
                  <div className="launch__loading launch__loading--bottom">
                    <Spinner />
                  </div>
                )}

                {!hasMore && !loadingMore && (
                  <div className="max-reached">No more launches found.</div>
                )}
              </div>
            ) : (
              <div className="no-content">No launches match your search.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
