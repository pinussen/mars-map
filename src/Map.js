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
  // Use standard Earth coordinates for now to test basic functionality
  return (
    <MapContainer 
      center={[0, 0]} 
      zoom={2} 
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        onError={onError}
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
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
