import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
window.L = L; // Make L globally available for proj4leaflet
import 'proj4leaflet'; // Ensure proj4leaflet extends L
import proj4 from 'proj4';

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

// Define the Mars Coordinate Reference System
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
proj4.defs("urn:ogc:def:crs:IAU:EOS:MARS", "+proj=longlat +R=3396190 +no_defs");

const marsCrs = new L.CRS.Proj4('urn:ogc:def:crs:IAU:EOS:MARS', 'EPSG:4326', {
  resolutions: [
    8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5
  ],
  origin: [0, 0]
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
  return (
    <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={true} crs={marsCrs}>
      <TileLayer
        url="https://tiles.openplanetary.org/mars/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openplanetary.org/">OpenPlanetaryMap</a>'
        onError={onError}
      />
      {locations.map(location => (
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
