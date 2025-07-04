import { h, Fragment } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import { Graph } from '../core/graph';
import { findShortestPath, calculateDefaultWeight, initWasm, getWasmPerformanceInfo } from '../core/dijkstra-wasm';
import { findShortestPath as jsImplementation } from '../core/dijkstra';
import { 
  normalizeEventCoordinates, 
  isPointInCircle, 
  isPointNearLineMidpoint,
  calculateCanvasDimensions,
  GEOMETRY_CONSTANTS 
} from '../core/geometry';
import { 
  saveState, 
  loadState, 
  clearState, 
  createStateObject,
  isValidState 
} from '../core/storage';
import { Canvas } from './Canvas';
import { ConnectionEditor } from './ConnectionEditor';
import { Controls } from './Controls';

export function App() {
  // State
  const [graph, setGraph] = useState(() => new Graph());
  const [draggingFrom, setDraggingFrom] = useState(null);
  const [dragLine, setDragLine] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [startCity, setStartCity] = useState(null);
  const [endCity, setEndCity] = useState(null);
  const [shortestPath, setShortestPath] = useState(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 900, height: 700 });
  const [wasmInfo, setWasmInfo] = useState({ isWasmReady: false, implementation: 'JavaScript' });
  const [implementationChoice, setImplementationChoice] = useState(() => {
    return localStorage.getItem('dijkstra-implementation') || 'auto';
  });
  
  // Refs
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const hoveredCityRef = useRef(null);
  const longPressTimer = useRef(null);
  const touchStartPos = useRef(null);
  
  // Initialize WASM and load state from localStorage on mount
  useEffect(() => {
    // Initialize WebAssembly module
    initWasm().then(() => {
      setWasmInfo(getWasmPerformanceInfo());
    });
    
    // Load saved state
    const savedState = loadState();
    if (savedState && isValidState(savedState)) {
      const loadedGraph = Graph.deserialize(savedState);
      setGraph(loadedGraph);
      setStartCity(savedState.startCity || null);
      setEndCity(savedState.endCity || null);
    }
  }, []);
  
  // Save state when it changes
  const persistState = () => {
    const state = createStateObject(graph, startCity, endCity);
    saveState(state);
  };
  
  // Handle canvas resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        const dimensions = calculateCanvasDimensions(width, isMobile);
        setCanvasDimensions(dimensions);
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);
  
  // Get city at position
  const getCityAtPosition = (x, y) => {
    return graph.getCities().find(city => 
      isPointInCircle({ x, y }, city, GEOMETRY_CONSTANTS.CITY_RADIUS)
    );
  };
  
  // Get connection at position
  const getConnectionAtPosition = (x, y) => {
    const cities = graph.getCities();
    const connections = graph.getConnections();
    
    for (const conn of connections) {
      const fromCity = cities.find(c => c.id === conn.from);
      const toCity = cities.find(c => c.id === conn.to);
      
      if (!fromCity || !toCity) continue;
      
      if (isPointNearLineMidpoint({ x, y }, fromCity, toCity, GEOMETRY_CONSTANTS.CONNECTION_CLICK_THRESHOLD)) {
        return conn;
      }
    }
    return null;
  };
  
  // Pointer event handlers
  const handlePointerDown = (e) => {
    if (e.button === 2) return; // Ignore right clicks
    
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    const { x, y } = normalizeEventCoordinates(e, canvas);
    
    // Check if clicking on a connection
    const connection = getConnectionAtPosition(x, y);
    if (connection) {
      setSelectedConnection(connection);
      setEditValue(connection.weight.toString());
      return;
    }
    
    const city = getCityAtPosition(x, y);
    
    if (city) {
      // Long press detection for mobile
      if (e.type === 'touchstart') {
        touchStartPos.current = { x, y, cityId: city.id };
        longPressTimer.current = setTimeout(() => {
          // Remove city
          const newGraph = new Graph();
          newGraph.cities = graph.getCities().filter(c => c.id !== city.id);
          newGraph.connections = graph.getConnections().filter(
            c => c.from !== city.id && c.to !== city.id
          );
          setGraph(newGraph);
          
          if (startCity === city.id) setStartCity(null);
          if (endCity === city.id) setEndCity(null);
          setShortestPath(null);
          
          // Vibrate for feedback
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
          
          persistState();
        }, GEOMETRY_CONSTANTS.LONG_PRESS_DURATION);
      }
      
      // Start dragging
      setDraggingFrom(city.id);
      setDragLine({ startX: city.x, startY: city.y, endX: x, endY: y });
      e.preventDefault();
    } else {
      // Add new city
      const newGraph = new Graph();
      newGraph.cities = [...graph.getCities()];
      newGraph.connections = [...graph.getConnections()];
      newGraph.addCity(x, y);
      setGraph(newGraph);
      persistState();
    }
  };
  
  const handlePointerMove = (e) => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    const { x, y } = normalizeEventCoordinates(e, canvas);
    
    // Clear long press if moved too much
    if (longPressTimer.current && touchStartPos.current) {
      const dx = Math.abs(x - touchStartPos.current.x);
      const dy = Math.abs(y - touchStartPos.current.y);
      if (dx > GEOMETRY_CONSTANTS.DRAG_THRESHOLD || dy > GEOMETRY_CONSTANTS.DRAG_THRESHOLD) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
    
    if (draggingFrom !== null) {
      setDragLine(prev => ({ ...prev, endX: x, endY: y }));
      
      const city = getCityAtPosition(x, y);
      if (city && city.id !== draggingFrom) {
        setHoveredCity(city.id);
        hoveredCityRef.current = city.id;
      } else {
        setHoveredCity(null);
        hoveredCityRef.current = null;
      }
    }
  };
  
  const handlePointerUp = (e) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    if (draggingFrom === null) return;
    
    const targetCity = hoveredCityRef.current;
    
    if (targetCity !== null && targetCity !== draggingFrom) {
      const fromCity = graph.getCityById(draggingFrom);
      const toCity = graph.getCityById(targetCity);
      
      if (fromCity && toCity) {
        const weight = calculateDefaultWeight(fromCity, toCity);
        const newGraph = new Graph();
        newGraph.cities = [...graph.getCities()];
        newGraph.connections = [...graph.getConnections()];
        
        if (newGraph.addConnection(draggingFrom, targetCity, weight)) {
          setGraph(newGraph);
          persistState();
        }
      }
    }
    
    // Reset states
    setDraggingFrom(null);
    setDragLine(null);
    setHoveredCity(null);
    hoveredCityRef.current = null;
  };
  
  const handlePointerLeave = () => {
    setDraggingFrom(null);
    setDragLine(null);
    setHoveredCity(null);
    hoveredCityRef.current = null;
  };
  
  const handleContextMenu = (e) => {
    e.preventDefault();
    
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    const { x, y } = normalizeEventCoordinates(e, canvas);
    const city = getCityAtPosition(x, y);
    
    if (city) {
      const newGraph = new Graph();
      newGraph.cities = graph.getCities().filter(c => c.id !== city.id);
      newGraph.connections = graph.getConnections().filter(
        c => c.from !== city.id && c.to !== city.id
      );
      setGraph(newGraph);
      
      if (startCity === city.id) setStartCity(null);
      if (endCity === city.id) setEndCity(null);
      setShortestPath(null);
      
      persistState();
    }
  };
  
  // Control handlers
  const handleStartCityChange = (cityId) => {
    setStartCity(cityId);
    persistState();
  };
  
  const handleEndCityChange = (cityId) => {
    setEndCity(cityId);
    persistState();
  };
  
  const handleCalculatePath = () => {
    if (!startCity || !endCity) {
      alert('Please select both start and end cities');
      return;
    }
    
    // Use different implementation based on user choice
    let result;
    if (implementationChoice === 'javascript') {
      // Force JavaScript implementation
      result = jsImplementation(graph, startCity, endCity);
    } else {
      // Use WASM implementation (or fallback automatically)
      result = findShortestPath(graph, startCity, endCity);
    }
    setShortestPath(result);
  };

  const handleImplementationChange = (choice) => {
    setImplementationChoice(choice);
    localStorage.setItem('dijkstra-implementation', choice);
    
    // Update wasmInfo to reflect the forced choice
    if (choice === 'javascript') {
      setWasmInfo(prev => ({ ...prev, implementation: 'JavaScript' }));
    } else if (choice === 'wasm' && wasmInfo.isWasmReady) {
      setWasmInfo(prev => ({ ...prev, implementation: 'WebAssembly' }));
    }
  };
  
  const handleUpdateConnectionWeight = () => {
    if (selectedConnection && editValue) {
      const newWeight = parseFloat(editValue);
      if (!isNaN(newWeight) && newWeight > 0) {
        const newGraph = new Graph();
        newGraph.cities = [...graph.getCities()];
        newGraph.connections = [...graph.getConnections()];
        newGraph.updateConnectionWeight(
          selectedConnection.from,
          selectedConnection.to,
          newWeight
        );
        setGraph(newGraph);
        setEditValue(newWeight.toString());
        persistState();
      }
    }
  };
  
  const handleCancelEdit = () => {
    setSelectedConnection(null);
    setEditValue('');
  };
  
  const handleResetCanvas = () => {
    if (confirm('Are you sure you want to reset the canvas? This will clear all cities and connections.')) {
      setGraph(new Graph());
      setStartCity(null);
      setEndCity(null);
      setShortestPath(null);
      setSelectedConnection(null);
      setEditValue('');
      clearState();
    }
  };

  const handleRandomizeConnections = () => {
    const cities = graph.getCities();
    if (cities.length < 2) {
      alert('Need at least 2 cities to create connections');
      return;
    }

    const newGraph = new Graph();
    newGraph.cities = [...cities];
    newGraph.connections = []; // Clear existing connections

    // Ensure each city has at least one connection by creating a spanning tree
    const connected = new Set();
    const unconnected = [...cities];
    
    // Start with first city
    connected.add(unconnected[0].id);
    unconnected.shift();
    
    // Connect remaining cities one by one to ensure connectivity
    // But choose random connected cities, not always the first one
    while (unconnected.length > 0) {
      const connectedCities = cities.filter(c => connected.has(c.id));
      const connectedCity = connectedCities[Math.floor(Math.random() * connectedCities.length)];
      const unconnectedCity = unconnected[Math.floor(Math.random() * unconnected.length)];
      
      const weight = calculateDefaultWeight(connectedCity, unconnectedCity);
      newGraph.addConnection(connectedCity.id, unconnectedCity.id, weight);
      
      connected.add(unconnectedCity.id);
      unconnected.splice(unconnected.indexOf(unconnectedCity), 1);
    }
    
    // Add strategic additional connections to create complex but realistic paths
    // Target: 50-80% more connections than minimum spanning tree
    const baseConnections = cities.length - 1; // MST connections
    const targetConnections = baseConnections + Math.floor(cities.length * 0.8);
    let currentConnections = baseConnections;
    
    // Create distance-weighted connection probability for realism
    const cityPairs = [];
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const distance = calculateDefaultWeight(cities[i], cities[j]);
        cityPairs.push({
          from: cities[i],
          to: cities[j],
          distance,
          // Prefer shorter connections but allow some longer ones
          probability: Math.max(0.1, 1 / (1 + distance / 30))
        });
      }
    }
    
    // Sort by distance to prioritize shorter connections first
    cityPairs.sort((a, b) => a.distance - b.distance);
    
    // Add connections with distance-based probability
    for (const pair of cityPairs) {
      if (currentConnections >= targetConnections) break;
      
      // Skip if already connected
      const alreadyConnected = newGraph.getConnections().some(conn => 
        (conn.from === pair.from.id && conn.to === pair.to.id) ||
        (conn.to === pair.from.id && conn.from === pair.to.id)
      );
      
      if (!alreadyConnected && Math.random() < pair.probability) {
        newGraph.addConnection(pair.from.id, pair.to.id, pair.distance);
        currentConnections++;
      }
    }
    
    // Add a few random long-distance connections for alternative routes
    const longDistanceConnections = Math.floor(cities.length * 0.2);
    let longConnections = 0;
    
    for (let attempts = 0; attempts < cities.length * 2 && longConnections < longDistanceConnections; attempts++) {
      const fromCity = cities[Math.floor(Math.random() * cities.length)];
      const toCity = cities[Math.floor(Math.random() * cities.length)];
      
      if (fromCity.id !== toCity.id) {
        // Skip if already connected
        const alreadyConnected = newGraph.getConnections().some(conn => 
          (conn.from === fromCity.id && conn.to === toCity.id) ||
          (conn.to === fromCity.id && conn.from === toCity.id)
        );
        
        if (!alreadyConnected) {
          const weight = calculateDefaultWeight(fromCity, toCity);
          newGraph.addConnection(fromCity.id, toCity.id, weight);
          longConnections++;
        }
      }
    }

    setGraph(newGraph);
    persistState();
  };
  
  return (
    <div className="app-layout">
      <div className="container">
        <div className="app-container">
          <div className="app-header">
            <div>
              <h1 className="app-header__title">Logistics Route Optimizer</h1>
              <p className="app-header__subtitle">Using Dijkstra's Algorithm to find shortest paths</p>
            </div>
            <div className="header-buttons">
              <button
                onClick={handleRandomizeConnections}
                className="btn btn--secondary"
              >
                Randomize Connections
              </button>
              <button
                onClick={handleResetCanvas}
                className="btn btn--danger"
              >
                Reset Canvas
              </button>
            </div>
          </div>
          
          <div className="app-content">
            <div className="content-grid">
              {/* Canvas Area */}
              <div ref={containerRef}>
                <Canvas
                  graph={graph}
                  dimensions={canvasDimensions}
                  dragLine={dragLine}
                  hoveredCity={hoveredCity}
                  selectedConnection={selectedConnection}
                  shortestPath={shortestPath}
                  startCity={startCity}
                  endCity={endCity}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerLeave}
                  onContextMenu={handleContextMenu}
                />
                
                <ConnectionEditor
                  selectedConnection={selectedConnection}
                  editValue={editValue}
                  onEditValueChange={setEditValue}
                  onUpdate={handleUpdateConnectionWeight}
                  onCancel={handleCancelEdit}
                />
                
                {/* Instructions */}
                <div className="instructions">
                  <div className="instructions__content">
                    <svg className="instructions__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="instructions__text">
                      <p className="instructions__title">How to use:</p>
                      <ul className="instructions__list">
                        <li>Click/tap on empty space to add cities</li>
                        <li>Drag from one city to another to connect them</li>
                        <li>Click/tap on a connection weight (number) to edit it</li>
                        <li className="hide-mobile">Right-click on a city to remove it</li>
                        <li className="show-mobile">Long press on a city to remove it (mobile)</li>
                        <li>Select start and end cities from the dropdowns</li>
                        <li>Tap "Calculate Shortest Path" to find optimal route</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Controls */}
              <Controls
                cities={graph.getCities()}
                startCity={startCity}
                endCity={endCity}
                shortestPath={shortestPath}
                wasmInfo={wasmInfo}
                implementationChoice={implementationChoice}
                onStartCityChange={handleStartCityChange}
                onEndCityChange={handleEndCityChange}
                onCalculatePath={handleCalculatePath}
                onImplementationChange={handleImplementationChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}