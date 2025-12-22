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
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="header">
        <h1>Mars Trilogy Interactive Map</h1>
        <p>Explore locations from Kim Stanley Robinson's Mars trilogy</p>
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
      </div>
    </div>
  );
}

export default App;
