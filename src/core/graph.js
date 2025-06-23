/**
 * Graph data structure for managing cities and connections
 */
export class Graph {
  constructor() {
    this.cities = [];
    this.connections = [];
  }

  /**
   * Add a new city to the graph
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Object} The created city
   */
  addCity(x, y) {
    const city = {
      id: Date.now(),
      name: this.generateCityName(this.cities.length),
      x,
      y
    };
    this.cities.push(city);
    return city;
  }

  /**
   * Generate city name for any number of cities
   * @param {number} index - City index
   * @returns {string} Generated city name
   */
  generateCityName(index) {
    if (index < 26) {
      // A-Z for first 26 cities
      return String.fromCharCode(65 + index);
    } else if (index < 702) {
      // AA-ZZ for next 676 cities (26*26)
      const firstChar = String.fromCharCode(65 + Math.floor((index - 26) / 26));
      const secondChar = String.fromCharCode(65 + ((index - 26) % 26));
      return firstChar + secondChar;
    } else {
      // AAA-ZZZ for next 17576 cities (26*26*26)
      const remaining = index - 702;
      const firstChar = String.fromCharCode(65 + Math.floor(remaining / (26 * 26)));
      const secondChar = String.fromCharCode(65 + Math.floor((remaining % (26 * 26)) / 26));
      const thirdChar = String.fromCharCode(65 + (remaining % 26));
      return firstChar + secondChar + thirdChar;
    }
  }

  /**
   * Remove a city and all its connections
   * @param {number} cityId - ID of the city to remove
   */
  removeCity(cityId) {
    this.cities = this.cities.filter(c => c.id !== cityId);
    this.connections = this.connections.filter(
      c => c.from !== cityId && c.to !== cityId
    );
  }

  /**
   * Add a connection between two cities
   * @param {number} fromId - Source city ID
   * @param {number} toId - Destination city ID
   * @param {number} weight - Connection weight/distance
   * @returns {Object|null} The created connection or null if already exists
   */
  addConnection(fromId, toId, weight) {
    // Check if connection already exists
    const exists = this.connections.some(conn => 
      (conn.from === fromId && conn.to === toId) ||
      (conn.to === fromId && conn.from === toId)
    );
    
    if (exists) return null;
    
    const connection = { from: fromId, to: toId, weight };
    this.connections.push(connection);
    return connection;
  }

  /**
   * Update the weight of an existing connection
   * @param {number} fromId - Source city ID
   * @param {number} toId - Destination city ID
   * @param {number} newWeight - New weight value
   */
  updateConnectionWeight(fromId, toId, newWeight) {
    this.connections = this.connections.map(conn => 
      (conn.from === fromId && conn.to === toId) ? 
      { ...conn, weight: newWeight } : conn
    );
  }

  /**
   * Get a city by ID
   * @param {number} cityId - City ID
   * @returns {Object|undefined} The city object
   */
  getCityById(cityId) {
    return this.cities.find(c => c.id === cityId);
  }

  /**
   * Get all cities
   * @returns {Array} Array of cities
   */
  getCities() {
    return [...this.cities];
  }

  /**
   * Get all connections
   * @returns {Array} Array of connections
   */
  getConnections() {
    return [...this.connections];
  }

  /**
   * Serialize the graph for storage
   * @returns {Object} Serialized graph data
   */
  serialize() {
    return {
      cities: this.cities,
      connections: this.connections
    };
  }

  /**
   * Deserialize graph data
   * @param {Object} data - Serialized graph data
   * @returns {Graph} New graph instance
   */
  static deserialize(data) {
    const graph = new Graph();
    if (data.cities) graph.cities = data.cities;
    if (data.connections) graph.connections = data.connections;
    return graph;
  }

}