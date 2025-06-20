import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, Navigation, MapPin } from 'lucide-react';

const DijkstraLogisticsApp = () => {
  const [cities, setCities] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggingFrom, setDraggingFrom] = useState(null);
  const [dragLine, setDragLine] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [startCity, setStartCity] = useState(null);
  const [endCity, setEndCity] = useState(null);
  const [shortestPath, setShortestPath] = useState(null);
  const [distances, setDistances] = useState({});
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 600, height: 400 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const hoveredCityRef = useRef(null);
  const longPressTimer = useRef(null);
  const touchStartPos = useRef(null);

  // Save state to localStorage
  const saveToLocalStorage = (newCities, newConnections, newStartCity, newEndCity) => {
    const state = {
      cities: newCities !== undefined ? newCities : cities,
      connections: newConnections !== undefined ? newConnections : connections,
      startCity: newStartCity !== undefined ? newStartCity : startCity,
      endCity: newEndCity !== undefined ? newEndCity : endCity
    };
    localStorage.setItem('dijkstraAppState', JSON.stringify(state));
  };

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('dijkstraAppState');
    if (savedState) {
      try {
        const { 
          cities: savedCities, 
          connections: savedConnections,
          startCity: savedStartCity,
          endCity: savedEndCity
        } = JSON.parse(savedState);
        setCities(savedCities || []);
        setConnections(savedConnections || []);
        setStartCity(savedStartCity || null);
        setEndCity(savedEndCity || null);
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  // Update selected connection weight
  const updateConnectionWeight = () => {
    if (selectedConnection && editValue) {
      const newWeight = parseFloat(editValue);
      if (!isNaN(newWeight) && newWeight > 0) {
        const updatedConnections = connections.map(conn => 
          (conn.from === selectedConnection.from && conn.to === selectedConnection.to) ? 
          { ...conn, weight: newWeight } : conn
        );
        setConnections(updatedConnections);
        saveToLocalStorage(cities, updatedConnections, startCity, endCity);
        setEditValue(newWeight.toString());
      }
    }
  };

  // Dijkstra's algorithm implementation
  const dijkstra = (start, end) => {
    const n = cities.length;
    const dist = {};
    const visited = {};
    const previous = {};
    
    // Initialize distances
    cities.forEach(city => {
      dist[city.id] = Infinity;
      visited[city.id] = false;
      previous[city.id] = null;
    });
    
    dist[start] = 0;
    
    // Main algorithm
    for (let i = 0; i < n; i++) {
      // Find unvisited vertex with minimum distance
      let u = null;
      let minDist = Infinity;
      
      cities.forEach(city => {
        if (!visited[city.id] && dist[city.id] < minDist) {
          u = city.id;
          minDist = dist[city.id];
        }
      });
      
      if (u === null) break;
      visited[u] = true;
      
      // Update distances of neighbors
      connections.forEach(conn => {
        if (conn.from === u && !visited[conn.to]) {
          const alt = dist[u] + conn.weight;
          if (alt < dist[conn.to]) {
            dist[conn.to] = alt;
            previous[conn.to] = u;
          }
        } else if (conn.to === u && !visited[conn.from]) {
          const alt = dist[u] + conn.weight;
          if (alt < dist[conn.from]) {
            dist[conn.from] = alt;
            previous[conn.from] = u;
          }
        }
      });
    }
    
    // Reconstruct path
    const path = [];
    let current = end;
    
    if (previous[current] === null && current !== start) {
      return null; // No path exists
    }
    
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }
    
    return {
      path,
      distance: dist[end],
      allDistances: dist
    };
  };

  // Get city at position
  const getCityAtPosition = (x, y) => {
    return cities.find(city => {
      const dx = city.x - x;
      const dy = city.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 20;
    });
  };

  // Check if click is on a connection line
  const getConnectionAtPosition = (x, y) => {
    for (const conn of connections) {
      const fromCity = cities.find(c => c.id === conn.from);
      const toCity = cities.find(c => c.id === conn.to);
      
      if (!fromCity || !toCity) continue;
      
      // Check if click is near the weight label (simplified)
      const midX = (fromCity.x + toCity.x) / 2;
      const midY = (fromCity.y + toCity.y) / 2;
      const dx = x - midX;
      const dy = y - midY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 30) {  // Increased click area
        return conn;
      }
    }
    return null;
  };

  // Get coordinates from mouse or touch event
  const getEventCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const canvas = canvasRef.current;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  };

  // Handle pointer down (mouse or touch)
  const handlePointerDown = (e) => {
    if (e.button === 2) return; // Ignore right clicks
    
    const { x, y } = getEventCoordinates(e);
    
    // Check if clicking on a connection line first
    const connection = getConnectionAtPosition(x, y);
    if (connection) {
      setSelectedConnection(connection);
      setEditValue(connection.weight.toString());
      return;
    }
    
    const city = getCityAtPosition(x, y);
    
    if (city) {
      // For touch events, set up long press detection
      if (e.type === 'touchstart') {
        touchStartPos.current = { x, y, cityId: city.id };
        longPressTimer.current = setTimeout(() => {
          // Long press detected - remove city
          const updatedCities = cities.filter(c => c.id !== city.id);
          const updatedConnections = connections.filter(c => c.from !== city.id && c.to !== city.id);
          setCities(updatedCities);
          setConnections(updatedConnections);
          const newStartCity = startCity === city.id ? null : startCity;
          const newEndCity = endCity === city.id ? null : endCity;
          setStartCity(newStartCity);
          setEndCity(newEndCity);
          saveToLocalStorage(updatedCities, updatedConnections, newStartCity, newEndCity);
          setShortestPath(null);
          
          // Vibrate for feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }, 500); // 500ms for long press
      }
      
      // Start dragging from a city
      setDraggingFrom(city.id);
      setDragLine({ startX: city.x, startY: city.y, endX: x, endY: y });
      e.preventDefault(); // Prevent default drag behavior
    } else if (cities.length < 10) {
      // Add new city
      const newCity = {
        id: Date.now(),
        name: String.fromCharCode(65 + cities.length), // A, B, C, etc.
        x,
        y
      };
      const updatedCities = [...cities, newCity];
      setCities(updatedCities);
      saveToLocalStorage(updatedCities, connections, startCity, endCity);
    }
  };

  // Handle pointer move (mouse or touch)
  const handlePointerMove = (e) => {
    const { x, y } = getEventCoordinates(e);
    
    // Clear long press timer if moved too much
    if (longPressTimer.current && touchStartPos.current) {
      const dx = Math.abs(x - touchStartPos.current.x);
      const dy = Math.abs(y - touchStartPos.current.y);
      if (dx > 10 || dy > 10) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
    
    if (draggingFrom !== null) {
      setDragLine(prev => ({ ...prev, endX: x, endY: y }));
      
      // Check if hovering over a city
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

  // Handle pointer up (mouse or touch)
  const handlePointerUp = (e) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    if (draggingFrom === null) {
      return;
    }
    
    const targetCity = hoveredCityRef.current;
    
    if (targetCity !== null && targetCity !== draggingFrom) {
      // Check if connection already exists
      const exists = connections.some(conn => 
        (conn.from === draggingFrom && conn.to === targetCity) ||
        (conn.to === draggingFrom && conn.from === targetCity)
      );
      
      if (!exists) {
        // Calculate default distance based on actual pixel distance
        const fromCity = cities.find(c => c.id === draggingFrom);
        const toCity = cities.find(c => c.id === targetCity);
        const dx = toCity.x - fromCity.x;
        const dy = toCity.y - fromCity.y;
        const pixelDistance = Math.sqrt(dx * dx + dy * dy);
        const defaultDistance = Math.round(pixelDistance / 10); // Scale down for reasonable values
        
        const newConnection = {
          from: draggingFrom,
          to: targetCity,
          weight: defaultDistance
        };
        const updatedConnections = [...connections, newConnection];
        setConnections(updatedConnections);
        saveToLocalStorage(cities, updatedConnections, startCity, endCity);
      }
    }
    
    // Reset states
    setDraggingFrom(null);
    setDragLine(null);
    setHoveredCity(null);
    hoveredCityRef.current = null;
  };

  // Handle right click
  const handleContextMenu = (e) => {
    e.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const canvas = canvasRef.current;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const city = getCityAtPosition(x, y);
    
    if (city) {
      // Remove city and its connections
      const updatedCities = cities.filter(c => c.id !== city.id);
      const updatedConnections = connections.filter(c => c.from !== city.id && c.to !== city.id);
      setCities(updatedCities);
      setConnections(updatedConnections);
      const newStartCity = startCity === city.id ? null : startCity;
      const newEndCity = endCity === city.id ? null : endCity;
      setStartCity(newStartCity);
      setEndCity(newEndCity);
      saveToLocalStorage(updatedCities, updatedConnections, newStartCity, newEndCity);
      setShortestPath(null);
    }
  };

  // Calculate shortest path
  const calculatePath = () => {
    if (!startCity || !endCity) {
      alert('Please select both start and end cities');
      return;
    }
    
    const result = dijkstra(startCity, endCity);
    setShortestPath(result);
    setDistances(result ? result.allDistances : {});
  };

  // Reset canvas
  const resetCanvas = () => {
    if (confirm('Are you sure you want to reset the canvas? This will clear all cities and connections.')) {
      setCities([]);
      setConnections([]);
      setStartCity(null);
      setEndCity(null);
      setShortestPath(null);
      setDistances({});
      setSelectedConnection(null);
      setEditValue('');
      localStorage.removeItem('dijkstraAppState');
    }
  };

  // Update edit value when selected connection changes
  useEffect(() => {
    if (selectedConnection) {
      setEditValue(selectedConnection.weight.toString());
    }
  }, [selectedConnection]);

  // Handle canvas resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        const height = isMobile ? Math.min(width * 0.8, 400) : 400;
        const canvasWidth = Math.min(width - 32, 800); // Max width 800px with padding
        
        setCanvasDimensions({ 
          width: canvasWidth, 
          height: height 
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Draw connections and cities
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    connections.forEach(conn => {
      const fromCity = cities.find(c => c.id === conn.from);
      const toCity = cities.find(c => c.id === conn.to);
      
      if (fromCity && toCity) {
        ctx.beginPath();
        ctx.moveTo(fromCity.x, fromCity.y);
        ctx.lineTo(toCity.x, toCity.y);
        
        // Check if this connection is selected
        const isSelected = selectedConnection && 
          selectedConnection.from === conn.from && 
          selectedConnection.to === conn.to;
        
        // Highlight if part of shortest path
        if (shortestPath && shortestPath.path.length > 0) {
          const pathIndex = shortestPath.path.indexOf(conn.from);
          if (pathIndex !== -1 && shortestPath.path[pathIndex + 1] === conn.to) {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = isSelected ? 5 : 3;
          } else if (pathIndex !== -1 && shortestPath.path[pathIndex - 1] === conn.to) {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = isSelected ? 5 : 3;
          } else {
            ctx.strokeStyle = isSelected ? '#f59e0b' : '#6b7280';
            ctx.lineWidth = isSelected ? 3 : 1;
          }
        } else {
          ctx.strokeStyle = isSelected ? '#f59e0b' : '#6b7280';
          ctx.lineWidth = isSelected ? 3 : 1;
        }
        
        ctx.stroke();
        
        // Draw weight label
        const midX = (fromCity.x + toCity.x) / 2;
        const midY = (fromCity.y + toCity.y) / 2;
        
        if (isSelected) {
          ctx.fillStyle = '#f59e0b';
        } else {
          ctx.fillStyle = '#1f2937';
        }
        
        ctx.font = '14px sans-serif';
        ctx.fillRect(midX - 15, midY - 10, 30, 20);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(conn.weight, midX, midY);
      }
    });
    
    // Draw drag line
    if (dragLine) {
      ctx.beginPath();
      ctx.moveTo(dragLine.startX, dragLine.startY);
      ctx.lineTo(dragLine.endX, dragLine.endY);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw cities
    cities.forEach(city => {
      ctx.beginPath();
      ctx.arc(city.x, city.y, 20, 0, 2 * Math.PI);
      
      // Different colors for different states
      if (city.id === startCity) {
        ctx.fillStyle = '#3b82f6';
      } else if (city.id === endCity) {
        ctx.fillStyle = '#ef4444';
      } else if (city.id === hoveredCity) {
        ctx.fillStyle = '#8b5cf6';
      } else if (city.id === draggingFrom) {
        ctx.fillStyle = '#f59e0b';
      } else if (shortestPath && shortestPath.path.includes(city.id)) {
        ctx.fillStyle = '#10b981';
      } else {
        ctx.fillStyle = '#6b7280';
      }
      
      ctx.fill();
      
      // Add glow effect for hovered city
      if (city.id === hoveredCity) {
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
      
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw city name
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(city.name, city.x, city.y);
    });
  }, [cities, connections, draggingFrom, dragLine, startCity, endCity, shortestPath, hoveredCity, selectedConnection]);


  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Logistics Route Optimizer</h1>
              <p className="text-gray-600 mt-2">Using Dijkstra's Algorithm to find shortest paths</p>
            </div>
            <button
              onClick={resetCanvas}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Reset Canvas
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Canvas Area */}
            <div className="lg:col-span-2">
              <div ref={containerRef} className="relative bg-gray-50 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={canvasDimensions.width}
                  height={canvasDimensions.height}
                  className="w-full cursor-crosshair touch-none"
                  style={{ cursor: 'crosshair', maxWidth: '100%' }}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handlePointerDown(e);
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    handlePointerMove(e);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handlePointerUp(e);
                  }}
                  onMouseLeave={() => {
                    setDraggingFrom(null);
                    setDragLine(null);
                    setHoveredCity(null);
                    hoveredCityRef.current = null;
                  }}
                  onContextMenu={handleContextMenu}
                />
                {cities.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Click to add cities (max 10)</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Connection Editor */}
              {selectedConnection && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Edit connection weight:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateConnectionWeight();
                          }
                        }}
                        className="px-2 py-1 border border-gray-300 rounded w-20 text-sm"
                        min="1"
                        step="1"
                      />
                      <button
                        onClick={updateConnectionWeight}
                        className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs sm:text-sm"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => {
                          setSelectedConnection(null);
                          setEditValue('');
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Instructions */}
              <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-blue-800">
                    <p className="font-semibold mb-1">How to use:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Click/tap on empty space to add cities</li>
                      <li>Drag from one city to another to connect them</li>
                      <li>Click/tap on a connection weight (number) to edit it</li>
                      <li className="hidden sm:list-item">Right-click on a city to remove it</li>
                      <li className="sm:hidden">Long press on a city to remove it (mobile)</li>
                      <li>Select start and end cities from the dropdowns</li>
                      <li>Tap "Calculate Shortest Path" to find optimal route</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="space-y-4 order-first lg:order-last">
              {/* Path Selection */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Route Planning</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-600">Start City</label>
                    <select
                      value={startCity || ''}
                      onChange={(e) => {
                        const newStartCity = e.target.value ? parseInt(e.target.value) : null;
                        setStartCity(newStartCity);
                        saveToLocalStorage(cities, connections, newStartCity, endCity);
                      }}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      <option value="">Select start city</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600">End City</label>
                    <select
                      value={endCity || ''}
                      onChange={(e) => {
                        const newEndCity = e.target.value ? parseInt(e.target.value) : null;
                        setEndCity(newEndCity);
                        saveToLocalStorage(cities, connections, startCity, newEndCity);
                      }}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      <option value="">Select end city</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={calculatePath}
                    className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Calculate Shortest Path
                  </button>
                </div>
              </div>
              
              {/* Results */}
              {shortestPath && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Results</h3>
                  {shortestPath.distance === Infinity ? (
                    <p className="text-red-600 text-sm">No path exists between selected cities</p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-2">
                        Total Distance: <span className="font-bold text-green-600">{shortestPath.distance}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">Path:</p>
                      <div className="flex items-center flex-wrap">
                        {shortestPath.path.map((cityId, index) => {
                          const city = cities.find(c => c.id === cityId);
                          return (
                            <React.Fragment key={cityId}>
                              <span className="text-sm font-medium text-green-700">
                                {city?.name}
                              </span>
                              {index < shortestPath.path.length - 1 && (
                                <span className="mx-2 text-gray-400">→</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* City Legend */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Legend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                    <span>Start City</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                    <span>End City</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span>Path City</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
                    <span>Regular City</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DijkstraLogisticsApp;
