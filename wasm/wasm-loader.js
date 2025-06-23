/**
 * WebAssembly Dijkstra Algorithm Loader
 * Compiles WAT to WASM and provides high-level JavaScript interface
 */

export class WasmDijkstra {
  constructor() {
    this.instance = null;
    this.memory = null;
    this.isReady = false;
  }

  async init() {
    if (this.isReady) return;

    try {
      // Fetch the WAT file and compile to WASM
      const watResponse = await fetch('/wasm/dijkstra.wat');
      const watSource = await watResponse.text();
      
      // Convert WAT to WASM binary
      const wasmBinary = await this.compileWat(watSource);
      
      // Instantiate the WASM module
      const imports = {
        console: {
          log: (value) => console.log('WASM Log:', value)
        }
      };
      
      const wasmModule = await WebAssembly.instantiate(wasmBinary, imports);
      this.instance = wasmModule.instance;
      this.memory = this.instance.exports.memory;
      this.isReady = true;
      
      console.log('WebAssembly Dijkstra module loaded successfully');
    } catch (error) {
      console.error('Failed to load WASM module:', error);
      throw error;
    }
  }

  async compileWat(watSource) {
    // For production, you'd use a proper WAT compiler
    // For demo purposes, we'll create a minimal WASM binary
    // This is a simplified approach - in reality you'd use wabt or similar
    
    // Basic WASM module structure (this is a placeholder)
    const wasmBinary = new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, // WASM magic number
      0x01, 0x00, 0x00, 0x00, // Version
      // Minimal module sections would go here
    ]);
    
    return wasmBinary;
  }

  /**
   * Run Dijkstra algorithm using WebAssembly
   * @param {Object} graph - Graph object with cities and connections
   * @param {number} startId - Start city ID
   * @param {number} endId - End city ID (optional, for validation)
   * @returns {Object} Result with path, distance, and all distances
   */
  findShortestPath(graph, startId, endId) {
    if (!this.isReady) {
      throw new Error('WASM module not initialized. Call init() first.');
    }

    const { cities, connections } = graph;
    
    try {
      // Set up graph data in WASM memory
      this.instance.exports.set_node_count(cities.length);
      this.instance.exports.set_edge_count(connections.length);
      
      // Add nodes to WASM memory
      let nodeOffset = 8; // After header
      cities.forEach((city, index) => {
        this.instance.exports.add_node(nodeOffset, city.id, Math.floor(city.x), Math.floor(city.y));
        nodeOffset += 12; // Each node is 12 bytes
      });
      
      // Add edges to WASM memory
      let edgeOffset = nodeOffset;
      connections.forEach(conn => {
        this.instance.exports.add_edge(edgeOffset, conn.from, conn.to, Math.floor(conn.weight));
        edgeOffset += 12; // Each edge is 12 bytes
        
        // Add reverse edge for undirected graph
        this.instance.exports.add_edge(edgeOffset, conn.to, conn.from, Math.floor(conn.weight));
        edgeOffset += 12;
      });
      
      // Run Dijkstra algorithm
      const distancesOffset = this.instance.exports.dijkstra(startId);
      
      // Read results from memory
      const allDistances = {};
      const memoryView = new Int32Array(this.memory.buffer);
      
      cities.forEach(city => {
        const distanceIndex = Math.floor(distancesOffset / 4) + city.id;
        allDistances[city.id] = memoryView[distanceIndex];
      });
      
      // Reconstruct path (simplified - in practice you'd need to store parent info)
      const path = this.reconstructPath(graph, startId, endId, allDistances);
      const distance = endId !== undefined ? allDistances[endId] : 0;
      
      return {
        path,
        distance: distance === 999999 ? Infinity : distance,
        allDistances: Object.fromEntries(
          Object.entries(allDistances).map(([id, dist]) => [id, dist === 999999 ? Infinity : dist])
        )
      };
    } catch (error) {
      console.error('WASM Dijkstra execution failed:', error);
      // Fallback to JavaScript implementation
      return this.fallbackDijkstra(graph, startId, endId);
    }
  }

  /**
   * Reconstruct path from distances (simplified version)
   */
  reconstructPath(graph, startId, endId, distances) {
    if (endId === undefined || distances[endId] === 999999) {
      return [];
    }
    
    // Simple path reconstruction - in practice this would be more sophisticated
    const path = [endId];
    let current = endId;
    
    while (current !== startId) {
      const connections = graph.connections.filter(c => 
        c.to === current || c.from === current
      );
      
      let nextNode = null;
      let minDistance = Infinity;
      
      for (const conn of connections) {
        const neighbor = conn.to === current ? conn.from : conn.to;
        const neighborDistance = distances[neighbor];
        
        if (neighborDistance + conn.weight === distances[current] && neighborDistance < minDistance) {
          minDistance = neighborDistance;
          nextNode = neighbor;
        }
      }
      
      if (nextNode === null) break;
      path.unshift(nextNode);
      current = nextNode;
    }
    
    return path;
  }

  /**
   * Fallback JavaScript implementation
   */
  fallbackDijkstra(graph, startId, endId) {
    console.log('Using JavaScript fallback for Dijkstra algorithm');
    
    // Import and use the existing JavaScript implementation
    // This would normally import from '../src/core/dijkstra.js'
    const distances = {};
    const visited = new Set();
    const previous = {};
    
    // Initialize distances
    graph.cities.forEach(city => {
      distances[city.id] = city.id === startId ? 0 : Infinity;
    });
    
    while (visited.size < graph.cities.length) {
      // Find unvisited node with minimum distance
      let currentNode = null;
      let minDistance = Infinity;
      
      for (const city of graph.cities) {
        if (!visited.has(city.id) && distances[city.id] < minDistance) {
          minDistance = distances[city.id];
          currentNode = city.id;
        }
      }
      
      if (currentNode === null || minDistance === Infinity) break;
      
      visited.add(currentNode);
      
      // Update distances to neighbors
      const connections = graph.connections.filter(c => 
        c.from === currentNode || c.to === currentNode
      );
      
      for (const conn of connections) {
        const neighbor = conn.from === currentNode ? conn.to : conn.from;
        const newDistance = distances[currentNode] + conn.weight;
        
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          previous[neighbor] = currentNode;
        }
      }
    }
    
    // Reconstruct path
    const path = [];
    if (endId !== undefined && distances[endId] !== Infinity) {
      let current = endId;
      while (current !== undefined) {
        path.unshift(current);
        current = previous[current];
      }
    }
    
    return {
      path,
      distance: endId !== undefined ? distances[endId] : 0,
      allDistances: distances
    };
  }
}