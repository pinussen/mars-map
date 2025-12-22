import React, { useState } from 'react';
import './App.css';
import Map from './Map';
import SimpleMarsGlobe from './SimpleMarsGlobe';
import SimpleTest from './SimpleTest';
import locations from './locations.json';

function App() {
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [mapError, setMapError] = useState(false);
  const [selectedBook, setSelectedBook] = useState('all');
  const [showTest, setShowTest] = useState(false);
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'

  // Debug: Log locations on mount
  React.useEffect(() => {
    console.log('Locations loaded:', locations);
    console.log('Total locations:', locations.length);
  }, []);

  // Show simple test if there are issues
  if (showTest) {
    return <SimpleTest />;
  }

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    filterLocations(query, selectedBook);
  };

  const handleBookFilter = (event) => {
    const book = event.target.value;
    setSelectedBook(book);
    const searchInput = document.querySelector('.search-bar');
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    filterLocations(searchQuery, book);
  };

  const filterLocations = (query, book) => {
    let filtered = locations;
    
    if (book !== 'all') {
      filtered = filtered.filter(location => location.Book === book);
    }
    
    if (query) {
      filtered = filtered.filter(location =>
        location.Location.toLowerCase().includes(query) ||
        location.Description.toLowerCase().includes(query)
      );
    }
    
    setFilteredLocations(filtered);
  };

  const books = ['Red Mars', 'Green Mars', 'Blue Mars'];
  const bookCounts = books.reduce((acc, book) => {
    acc[book] = locations.filter(loc => loc.Book === book).length;
    return acc;
  }, {});

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="header">
        <h1>Mars Trilogy Interactive Map</h1>
        <p>Explore locations from Kim Stanley Robinson's Mars trilogy</p>
        <button onClick={() => setShowTest(!showTest)} style={{ margin: '10px', padding: '5px 10px' }}>
          {showTest ? 'Show Map' : 'Show Test'}
        </button>
        <button 
          onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')} 
          style={{ 
            margin: '10px', 
            padding: '8px 15px',
            backgroundColor: viewMode === '3d' ? '#ff6b35' : '#8B4513',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {viewMode === '2d' ? '🌍 Switch to 3D Globe' : '🗺️ Switch to 2D Map'}
        </button>
      </div>
      
      <div className="controls">
        <input
          type="text"
          className="search-bar"
          placeholder="Search for a location..."
          onChange={handleSearch}
        />
        
        <select className="book-filter" value={selectedBook} onChange={handleBookFilter}>
          <option value="all">All Books ({locations.length} locations)</option>
          {books.map(book => (
            <option key={book} value={book}>
              {book} ({bookCounts[book]} locations)
            </option>
          ))}
        </select>
      </div>
      
      {mapError && <p className="error">Map tiles failed to load. Check your connection or the tile server status.</p>}
      
      <div className="location-count">
        Showing {filteredLocations.length} of {locations.length} locations
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        {viewMode === '2d' ? (
          <>
            <Map locations={filteredLocations} onError={() => setMapError(true)} />
            
            <div className="legend">
              <h4>Book Legend</h4>
              <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#ff4444'}}></div>
                Red Mars
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#44ff44'}}></div>
                Green Mars
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#4444ff'}}></div>
                Blue Mars
              </div>
            </div>
          </>
        ) : (
          <SimpleMarsGlobe 
            locations={filteredLocations} 
            onLocationClick={(location) => {
              console.log('Selected location:', location);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
