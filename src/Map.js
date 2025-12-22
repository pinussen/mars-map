import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import proj4 from 'proj4';
import 'leaflet/dist/leaflet.css';
import 'proj4leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Make L globally available for proj4leaflet
window.L = L;

// Fix for default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Define Mars coordinate system
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
proj4.defs("EPSG:49900", "+proj=longlat +a=3396190 +b=3376200 +no_defs");

// Create Mars CRS
const marsCrs = new L.Proj.CRS('EPSG:49900', '+proj=longlat +a=3396190 +b=3376200 +no_defs', {
  resolutions: [
    8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5
  ],
  origin: [-180, 90],
  bounds: L.bounds([-180, -90], [180, 90])
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
    <MapContainer 
      center={[0, 0]} 
      zoom={2} 
      scrollWheelZoom={true}
      crs={marsCrs}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://tiles.openplanetary.org/mars/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openplanetary.org/">OpenPlanetaryMap</a>'
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
