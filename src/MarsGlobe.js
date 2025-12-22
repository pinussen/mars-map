import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Mars globe component
function Mars({ locations, onLocationClick }) {
  const meshRef = useRef();
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Rotate the globe slowly
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  // Convert lat/lng to 3D coordinates on sphere
  const latLngToVector3 = (lat, lng, radius = 1.01) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  // Create Mars texture (procedural for now, could load real Mars texture)
  const createMarsTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Create a gradient that looks Mars-like
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#CD853F'); // Sandy brown
    gradient.addColorStop(0.3, '#A0522D'); // Sienna
    gradient.addColorStop(0.6, '#8B4513'); // Saddle brown
    gradient.addColorStop(1, '#654321'); // Dark brown
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 512);
    
    // Add some noise for texture
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const size = Math.random() * 3;
      context.fillStyle = `rgba(${139 + Math.random() * 50}, ${69 + Math.random() * 30}, ${19 + Math.random() * 20}, 0.3)`;
      context.fillRect(x, y, size, size);
    }
    
    return new THREE.CanvasTexture(canvas);
  };

  const marsTexture = createMarsTexture();

  return (
    <group>
      {/* Mars sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshPhongMaterial map={marsTexture} />
      </mesh>
      
      {/* Location markers */}
      {locations.map((location) => {
        const position = latLngToVector3(location.Latitude, location.Longitude);
        const colors = {
          'Red Mars': '#ff4444',
          'Green Mars': '#44ff44', 
          'Blue Mars': '#4444ff'
        };
        const color = colors[location.Book] || '#ffffff';
        
        return (
          <group key={location.Location}>
            <mesh 
              position={position}
              onClick={() => {
                setSelectedLocation(location);
                onLocationClick && onLocationClick(location);
              }}
            >
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
            
            <Text
              position={[position.x * 1.1, position.y * 1.1, position.z * 1.1]}
              fontSize={0.03}
              color={color}
              anchorX="center"
              anchorY="middle"
            >
              {location.Location}
            </Text>
          </group>
        );
      })}
      
      {/* Selected location popup */}
      {selectedLocation && (
        <Html position={latLngToVector3(selectedLocation.Latitude, selectedLocation.Longitude, 1.3)}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            minWidth: '200px',
            fontSize: '12px'
          }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#ff6b35' }}>{selectedLocation.Location}</h4>
            <p style={{ margin: '2px 0' }}><strong>Book:</strong> {selectedLocation.Book}</p>
            <p style={{ margin: '2px 0' }}><strong>Coordinates:</strong> {selectedLocation.Latitude.toFixed(2)}°, {selectedLocation.Longitude.toFixed(2)}°</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '11px' }}>{selectedLocation.Description}</p>
            <button 
              onClick={() => setSelectedLocation(null)}
              style={{
                background: '#ff6b35',
                border: 'none',
                color: 'white',
                padding: '3px 8px',
                borderRadius: '3px',
                marginTop: '5px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}

// Main Mars Globe component
const MarsGlobe = ({ locations, onLocationClick }) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#000011' }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        
        {/* Mars globe */}
        <Mars locations={locations} onLocationClick={onLocationClick} />
        
        {/* Controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={1.5}
          maxDistance={5}
          autoRotate={false}
        />
        
        {/* Stars background */}
        <mesh>
          <sphereGeometry args={[50, 32, 32]} />
          <meshBasicMaterial color="#000011" side={THREE.BackSide} />
        </mesh>
      </Canvas>
      
      {/* Instructions overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0 0 5px 0' }}><strong>Controls:</strong></p>
        <p style={{ margin: '2px 0' }}>• Drag to rotate</p>
        <p style={{ margin: '2px 0' }}>• Scroll to zoom</p>
        <p style={{ margin: '2px 0' }}>• Click markers for info</p>
      </div>
    </div>
  );
};

export default MarsGlobe;