import React, { useState } from 'react';
import './App.css';
import Map from './Map';
import locationsWithTime from './locationsWithTime.json';
import waterLevels from './waterLevels.json';

function App() {
  const [selectedBook, setSelectedBook] = useState('all');
  const [showInfrastructure, setShowInfrastructure] = useState(true);
  const [currentYear, setCurrentYear] = useState(2200);
  const [mapError, setMapError] = useState(false);

  // Filter locations by year and book
  const getFilteredLocations = () => {
    let filtered = locationsWithTime.filter(location => location.Year <= currentYear);
    
    if (selectedBook !== 'all') {
      filtered = filtered.filter(location => location.Book === selectedBook);
    }
    
    return filtered;
  };

  const filteredLocations = getFilteredLocations();

  // Get current water level data
  const getCurrentWaterLevel = () => {
    const sortedWaterLevels = waterLevels.sort((a, b) => a.year - b.year);
    let currentWaterLevel = sortedWaterLevels[0];
    
    for (const waterLevel of sortedWaterLevels) {
      if (waterLevel.year <= currentYear) {
        currentWaterLevel = waterLevel;
      } else {
        break;
      }
    }
    
    return currentWaterLevel;
  };

  const handleBookFilter = (event) => {
    setSelectedBook(event.target.value);
  };

  const handleYearChange = (event) => {
    setCurrentYear(parseInt(event.target.value));
  };

  const books = ['Red Mars', 'Green Mars', 'Blue Mars'];
  const bookCounts = books.reduce((acc, book) => {
    acc[book] = locationsWithTime.filter(loc => loc.Book === book && loc.Year <= currentYear).length;
    return acc;
  }, {});

  const totalLocations = locationsWithTime.filter(loc => loc.Year <= currentYear).length;
  const currentWaterLevel = getCurrentWaterLevel();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Map takes full screen */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Map 
          locations={filteredLocations} 
          onError={() => setMapError(true)}
          showInfrastructure={showInfrastructure}
          currentYear={currentYear}
          waterLevel={currentWaterLevel}
        />
      </div>
      
      {/* Compact header overlay */}
      <div className="header-overlay">
        <h1>Mars Trilogy Map</h1>
        <div className="year-display">{currentYear}</div>
      </div>
      
      {/* Time slider overlay */}
      <div className="time-slider-overlay">
        <div className="time-slider-container">
          <label>Year: {currentYear}</label>
          <input
            type="range"
            min="2027"
            max="2200"
            step="1"
            value={currentYear}
            onChange={handleYearChange}
            className="time-slider"
          />
          <div className="time-markers">
            <span>2027</span>
            <span className="war-marker">2061 ⚔️</span>
            <span>2127</span>
            <span>2200</span>
          </div>
        </div>
        <div className="terraforming-status">
          {currentYear === 2061 && "🔥 First Martian Revolution - Space Elevator Falls"}
          {currentYear !== 2061 && currentWaterLevel.description}
        </div>
      </div>
      
      {/* Compact controls overlay */}
      <div className="controls-overlay">
        <select className="book-filter-compact" value={selectedBook} onChange={handleBookFilter}>
          <option value="all">All ({totalLocations})</option>
          {books.map(book => (
            <option key={book} value={book}>
              {book} ({bookCounts[book]})
            </option>
          ))}
        </select>
        
        <label className="infrastructure-toggle">
          <input
            type="checkbox"
            checked={showInfrastructure}
            onChange={(e) => setShowInfrastructure(e.target.checked)}
          />
          <span>Infrastructure</span>
        </label>
        
        <div className="location-count-compact">
          {filteredLocations.length} / {totalLocations}
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
        <div className="legend-item-compact">
          <div className="legend-color" style={{backgroundColor: '#4A90E2'}}></div>
          Water
        </div>
      </div>
    </div>
  );
}

export default App;