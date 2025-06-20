/**
 * Implementation of Dijkstra's shortest path algorithm
 */

/**
 * Find the shortest path between two nodes using Dijkstra's algorithm
 * @param {Object} graph - Graph object with cities and connections
 * @param {number} startId - Starting city ID
 * @param {number} endId - Ending city ID
 * @returns {Object|null} Path result or null if no path exists
 */
export function findShortestPath(graph, startId, endId) {
  const cities = graph.getCities();
  const connections = graph.getConnections();
  
  if (!cities.length || !connections.length) {
    return null;
  }
  
  const dist = {};
  const visited = {};
  const previous = {};
  
  // Initialize distances
  cities.forEach(city => {
    dist[city.id] = Infinity;
    visited[city.id] = false;
    previous[city.id] = null;
  });
  
  dist[startId] = 0;
  
  // Main algorithm
  for (let i = 0; i < cities.length; i++) {
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
  
  // Check if path exists
  if (dist[endId] === Infinity) {
    return {
      path: [],
      distance: Infinity,
      allDistances: dist
    };
  }
  
  // Reconstruct path
  const path = [];
  let current = endId;
  
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }
  
  return {
    path,
    distance: dist[endId],
    allDistances: dist
  };
}

/**
 * Calculate default weight based on Euclidean distance
 * @param {Object} fromCity - Source city
 * @param {Object} toCity - Destination city
 * @returns {number} Calculated weight
 */
export function calculateDefaultWeight(fromCity, toCity) {
  const dx = toCity.x - fromCity.x;
  const dy = toCity.y - fromCity.y;
  const pixelDistance = Math.sqrt(dx * dx + dy * dy);
  return Math.round(pixelDistance / 10); // Scale down for reasonable values
}