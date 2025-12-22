import React, { useEffect, useRef, useState } from 'react';

const SimpleMarsGlobe = ({ locations, onLocationClick }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const latLngToVector3 = (lat, lng, radius = 1.02) => {
    const THREE = window.THREE;
    if (!THREE) return null;
    
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  const updateMarkers = React.useCallback(() => {
    const THREE = window.THREE;
    if (!THREE || !sceneRef.current || !locations) return;

    // Remove existing markers
    markersRef.current.forEach(marker => {
      sceneRef.current.remove(marker);
    });
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      const position = latLngToVector3(location.Latitude, location.Longitude);
      if (!position) return;

      const colors = {
        'Red Mars': 0xff4444,
        'Green Mars': 0x44ff44,
        'Blue Mars': 0x4444ff
      };
      const color = colors[location.Book] || 0xffffff;

      const geometry = new THREE.SphereGeometry(0.02, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color });
      const marker = new THREE.Mesh(geometry, material);
      
      marker.position.copy(position);
      marker.userData = location;
      
      sceneRef.current.add(marker);
      markersRef.current.push(marker);
    });
  }, [locations]);

  const initThreeJS = React.useCallback(() => {
    const THREE = window.THREE;
    if (!THREE || !mountRef.current) return;

    // Create fallback Mars texture function
    const createMarsTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      
      // Create a more detailed Mars-like surface
      // Base color
      context.fillStyle = '#CD853F';
      context.fillRect(0, 0, 1024, 512);
      
      // Add polar ice caps (lighter areas at top and bottom)
      const polarGradient = context.createRadialGradient(512, 0, 0, 512, 0, 100);
      polarGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      polarGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      context.fillStyle = polarGradient;
      context.fillRect(0, 0, 1024, 100);
      
      const southPolarGradient = context.createRadialGradient(512, 512, 0, 512, 512, 100);
      southPolarGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      southPolarGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      context.fillStyle = southPolarGradient;
      context.fillRect(0, 412, 1024, 100);
      
      // Add some darker regions (like Syrtis Major)
      context.fillStyle = 'rgba(139, 69, 19, 0.4)';
      context.fillRect(200, 150, 300, 200);
      context.fillRect(600, 200, 200, 150);
      
      // Add surface details
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const size = Math.random() * 3;
        const brightness = Math.random() * 0.3;
        context.fillStyle = `rgba(${205 + Math.random() * 50}, ${133 + Math.random() * 40}, ${63 + Math.random() * 30}, ${brightness})`;
        context.fillRect(x, y, size, size);
      }
      
      return new THREE.CanvasTexture(canvas);
    };

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000011);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Mars globe
    const geometry = new THREE.SphereGeometry(1, 64, 32);
    
    // Load real Mars texture
    const textureLoader = new THREE.TextureLoader();
    
    // Try to load a real Mars texture, with fallback
    const marsTextureUrl = 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg';
    
    textureLoader.load(
      marsTextureUrl,
      // Success callback
      (texture) => {
        const material = new THREE.MeshPhongMaterial({ map: texture });
        const globe = new THREE.Mesh(geometry, material);
        scene.add(globe);
        globeRef.current = globe;
        updateMarkers();
        setIsLoaded(true);
      },
      // Progress callback
      undefined,
      // Error callback - fallback to procedural texture
      (error) => {
        console.log('Failed to load Mars texture, using fallback:', error);
        const fallbackTexture = createMarsTexture();
        const material = new THREE.MeshPhongMaterial({ map: fallbackTexture });
        const globe = new THREE.Mesh(geometry, material);
        scene.add(globe);
        globeRef.current = globe;
        updateMarkers();
        setIsLoaded(true);
      }
    );

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      starsVertices.push(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (event) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event) => {
      if (isDragging && globeRef.current) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y
        };

        globeRef.current.rotation.y += deltaMove.x * 0.01;
        globeRef.current.rotation.x += deltaMove.y * 0.01;

        previousMousePosition = { x: event.clientX, y: event.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (event) => {
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(1.5, Math.min(5, camera.position.z));
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Auto-rotate
      if (!isDragging && globeRef.current) {
        globeRef.current.rotation.y += 0.002;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (mountRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Don't call updateMarkers or setIsLoaded here - it's handled in texture loading
  }, [updateMarkers]);

  useEffect(() => {
    // Only proceed if Three.js is available
    if (typeof window !== 'undefined' && window.THREE) {
      initThreeJS();
    } else {
      // Load Three.js dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = () => {
        initThreeJS();
      };
      document.head.appendChild(script);
    }

    return () => {
      const currentMount = mountRef.current;
      if (rendererRef.current && currentMount) {
        currentMount.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [initThreeJS]);

  useEffect(() => {
    if (sceneRef.current && globeRef.current) {
      updateMarkers();
    }
  }, [locations, updateMarkers]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={mountRef} 
        style={{ width: '100%', height: '100%' }}
        onClick={(e) => {
          // Simple click detection - in a real implementation you'd use raycasting
          console.log('Globe clicked');
        }}
      />
      
      {/* Instructions */}
      {isLoaded && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: 'white',
          background: 'rgba(0,0,0,0.8)',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '200px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ff6b35' }}>Mars Globe Controls</h4>
          <p style={{ margin: '2px 0' }}>• Drag to rotate Mars</p>
          <p style={{ margin: '2px 0' }}>• Scroll to zoom in/out</p>
          <p style={{ margin: '2px 0' }}>• Colored dots show locations</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '10px', opacity: 0.8 }}>
            Red = Red Mars, Green = Green Mars, Blue = Blue Mars
          </p>
        </div>
      )}

      {/* Loading message */}
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '18px',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <p>Loading Mars Globe...</p>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>Loading Three.js library</p>
        </div>
      )}
    </div>
  );
};

export default SimpleMarsGlobe;