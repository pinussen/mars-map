import React, { useState } from 'react';
import './App.css';
import Map from './Map';
import locations from './locations.json';

function App() {
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [mapError, setMapError] = useState(false);
  const [selectedBook, setSelectedBook] = useState('all');

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
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Map takes full screen */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Map locations={filteredLocations} onError={() => setMapError(true)} />
      </div>
      
      {/* Compact header overlay */}
      <div className="header-overlay">
        <h1>Mars Trilogy Map</h1>
      </div>
      
      {/* Compact controls overlay */}
      <div className="controls-overlay">
        <input
          type="text"
          className="search-bar-compact"
          placeholder="Search locations..."
          onChange={handleSearch}
        />
        
        <select className="book-filter-compact" value={selectedBook} onChange={handleBookFilter}>
          <option value="all">All ({locations.length})</option>
          {books.map(book => (
            <option key={book} value={book}>
              {book} ({bookCounts[book]})
            </option>
          ))}
        </select>
        
        <div className="location-count-compact">
          {filteredLocations.length} / {locations.length}
        </div>
      </div>
      
      {mapError && <p className="error">Map tiles failed to load.</p>}
      
      {/* Legend overlay */}
      <div className="legend-overlay">
        <div className="legend-item-compact">
          <div className="legend-color" style={{backgroundColor: '#ff4444'}}></div>
          Red Mars
        </div>
        <div className="legend-item-compact">
          <div className="legend-color" style={{backgroundColor: '#44ff44'}}></div>
          Green Mars
        </div>
        <div className="legend-item-compact">
          <div className="legend-color" style={{backgroundColor: '#4444ff'}}></div>
          Blue Mars
        </div>
      </div>
    </div>
  );
}

export default App;
