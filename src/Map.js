import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import infrastructure from './infrastructure.json';

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

// Get line style based on infrastructure type
const getLineStyle = (item) => {
  const baseStyle = {
    color: item.color,
    weight: item.type === 'railway' ? 4 : item.type === 'road' ? 3 : 2,
    opacity: 0.8
  };

  if (item.style === 'dashed') {
    baseStyle.dashArray = '10, 10';
  } else if (item.style === 'dotted') {
    baseStyle.dashArray = '2, 8';
  }

  return baseStyle;
};

// Filter infrastructure by year
const getInfrastructureForYear = (year) => {
  const infrastructureYears = {
    'Space Elevator Cable': 2055,
    'Elevator Debris Field': 2061,
    'Underground Tunnel Network': 2085,
    'Polar Express': 2090,
    'Trans-Martian Railway': 2130,
    'Northern Ocean Railway': 2160,
    'Valles Marineris Highway': 2170,
    'Tharsis Ring Road': 2175,
    'Hellas Sea Coastal Road': 2180,
    'Areosynchronous Orbital Path': 2055
  };

  return infrastructure.filter(item => {
    const itemYear = infrastructureYears[item.name] || 2200;
    return itemYear <= year;
  });
};

const Map = ({ locations, onError, showInfrastructure = true, currentYear = 2200, waterLevel }) => {
  const currentInfrastructure = getInfrastructureForYear(currentYear);

  return (
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
        url="https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openplanetary.org/">OpenPlanetaryMap</a> - Mars Basemap'
        maxZoom={8}
        minZoom={1}
        noWrap={true}
        bounds={[[-85, -180], [85, 180]]}
      />
      
      {/* Water bodies layer */}
      {waterLevel && waterLevel.waterBodies.map((waterBody, index) => (
        <Polygon
          key={`water-${index}`}
          positions={waterBody.coordinates}
          pathOptions={{
            color: waterBody.color,
            weight: 1,
            opacity: waterBody.opacity,
            fill: true,
            fillColor: waterBody.color,
            fillOpacity: waterBody.opacity
          }}
        >
          <Popup>
            <div className="water-popup">
              <h4>{waterBody.name}</h4>
              <p><strong>Year:</strong> {waterLevel.year}</p>
              <p>{waterLevel.description}</p>
            </div>
          </Popup>
        </Polygon>
      ))}
      
      {/* Infrastructure layer */}
      {showInfrastructure && currentInfrastructure.map((item, index) => {
        if (item.type === 'orbit') {
          return (
            <Circle
              key={`infra-${index}`}
              center={item.coordinates[0]}
              radius={100000}
              pathOptions={{
                color: item.color,
                weight: 2,
                opacity: 0.6,
                fill: false,
                dashArray: '5, 10'
              }}
            />
          );
        } else if (item.coordinates.length > 1) {
          return (
            <Polyline
              key={`infra-${index}`}
              positions={item.coordinates}
              pathOptions={getLineStyle(item)}
            >
              <Popup>
                <div className="infrastructure-popup">
                  <h4>{item.name}</h4>
                  <p><strong>Type:</strong> {item.type}</p>
                  <p><strong>Book:</strong> {item.book}</p>
                  <p>{item.description}</p>
                </div>
              </Popup>
            </Polyline>
          );
        }
        return null;
      })}
      
      {/* Location markers */}
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
              <p><strong>Founded:</strong> {location.Year}</p>
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
