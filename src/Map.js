import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Create custom icons for different books
const createBookIcon = (book) => {
  const colors = {
    'Red Mars': '#ff4444',
    'Green Mars': '#44ff44', 
    'Blue Mars': '#4444ff'
  };
  
  const color = colors[book] || '#888888';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const Map = ({ locations, onError }) => {
  const [tileSource, setTileSource] = React.useState('mars1');

  const tileSources = {
    mars1: {
      url: "https://tiles.openplanetary.org/mars/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openplanetary.org/">OpenPlanetaryMap</a> - Mars Surface',
      maxZoom: 10
    },
    mars2: {
      url: "https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openplanetary.org/">OpenPlanetaryMap</a> - Mars Basemap',
      maxZoom: 8
    },
    earth: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors (Fallback)',
      maxZoom: 18
    }
  };

  const handleTileError = (e) => {
    console.log('Tile source failed:', tileSource);
    if (tileSource === 'mars1') {
      setTileSource('mars2');
    } else if (tileSource === 'mars2') {
      setTileSource('earth');
    }
    onError && onError(e);
  };

  const currentTileSource = tileSources[tileSource];

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer 
        center={[0, 0]} 
        zoom={2} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        worldCopyJump={false}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          key={tileSource} // Force re-render when tile source changes
          url={currentTileSource.url}
          attribution={currentTileSource.attribution}
          eventHandlers={{
            error: handleTileError,
          }}
          maxZoom={currentTileSource.maxZoom}
          minZoom={1}
          noWrap={true}
          bounds={[[-85, -180], [85, 180]]}
        />
        {locations && locations.map(location => (
          <Marker 
            key={location.Location} 
            position={[location.Latitude, location.Longitude]}
            icon={createBookIcon(location.Book)}
          >
            <Popup>
              <div className="location-popup">
                <h3>{location.Location}</h3>
                <p><strong>Book:</strong> {location.Book}</p>
                <p><strong>Coordinates:</strong> {location.Latitude.toFixed(2)}°, {location.Longitude.toFixed(2)}°</p>
                <p>{location.Description}</p>
                {tileSource === 'earth' && <p><em>Note: Showing Earth map as Mars tiles are unavailable</em></p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Tile source selector */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 1000
      }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Map Source:</label>
        <select 
          value={tileSource} 
          onChange={(e) => setTileSource(e.target.value)}
          style={{ marginLeft: '5px', fontSize: '12px' }}
        >
          <option value="mars1">Mars (OpenPlanetary)</option>
          <option value="mars2">Mars (Basemap)</option>
          <option value="earth">Earth (Fallback)</option>
        </select>
      </div>
    </div>
  );
};

export default Map;
