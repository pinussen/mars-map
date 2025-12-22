import React, { useState } from 'react';
import './App.css';
import Map from './Map';
import locations from './locations.json';

function App() {
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [mapError, setMapError] = useState(false);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    const filtered = locations.filter(location =>
      location.Location.toLowerCase().includes(query)
    );
    setFilteredLocations(filtered);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1>Mars Map</h1>
      <input
        type="text"
        className="search-bar"
        placeholder="Search for a location..."
        onChange={handleSearch}
      />
      {mapError && <p className="error">Map tiles failed to load. Check your connection or the tile server status.</p>}
      <Map locations={filteredLocations} onError={() => setMapError(true)} />
    </div>
  );
}

export default App;
