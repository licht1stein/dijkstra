/**
 * LocalStorage persistence utilities
 */

const STORAGE_KEY = 'dijkstraAppState';

/**
 * Save application state to localStorage
 * @param {Object} state - State object to save
 */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

/**
 * Load application state from localStorage
 * @returns {Object|null} Saved state or null if not found
 */
export function loadState() {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return null;
}

/**
 * Clear saved state from localStorage
 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear state:', error);
  }
}

/**
 * Create a state object for persistence
 * @param {Graph} graph - Graph instance
 * @param {number|null} startCity - Start city ID
 * @param {number|null} endCity - End city ID
 * @returns {Object} State object
 */
export function createStateObject(graph, startCity, endCity) {
  return {
    ...graph.serialize(),
    startCity,
    endCity,
    timestamp: Date.now()
  };
}

/**
 * Validate loaded state
 * @param {Object} state - State object to validate
 * @returns {boolean} Whether state is valid
 */
export function isValidState(state) {
  return state &&
    Array.isArray(state.cities) &&
    Array.isArray(state.connections) &&
    state.cities.every(city => 
      typeof city.id === 'number' &&
      typeof city.x === 'number' &&
      typeof city.y === 'number' &&
      typeof city.name === 'string'
    ) &&
    state.connections.every(conn =>
      typeof conn.from === 'number' &&
      typeof conn.to === 'number' &&
      typeof conn.weight === 'number'
    );
}