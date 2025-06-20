/**
 * Geometric calculations and coordinate utilities
 */

/**
 * Check if a point is inside a circle
 * @param {Object} point - Point with x, y coordinates
 * @param {Object} circle - Circle center with x, y coordinates
 * @param {number} radius - Circle radius
 * @returns {boolean}
 */
export function isPointInCircle(point, circle, radius) {
  const dx = circle.x - point.x;
  const dy = circle.y - point.y;
  return Math.sqrt(dx * dx + dy * dy) <= radius;
}

/**
 * Check if a point is near a line segment
 * @param {Object} point - Point with x, y coordinates
 * @param {Object} lineStart - Line start point
 * @param {Object} lineEnd - Line end point
 * @param {number} threshold - Distance threshold
 * @returns {boolean}
 */
export function isPointNearLine(point, lineStart, lineEnd, threshold) {
  const A = lineEnd.x - lineStart.x;
  const B = lineEnd.y - lineStart.y;
  const C = point.x - lineStart.x;
  const D = point.y - lineStart.y;
  
  const dot = A * C + B * D;
  const lenSq = A * A + B * B;
  
  if (lenSq === 0) return false;
  
  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));
  
  const closestX = lineStart.x + param * A;
  const closestY = lineStart.y + param * B;
  
  const dx = point.x - closestX;
  const dy = point.y - closestY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < threshold;
}

/**
 * Check if a point is near the midpoint of a line
 * @param {Object} point - Point with x, y coordinates
 * @param {Object} lineStart - Line start point
 * @param {Object} lineEnd - Line end point
 * @param {number} threshold - Distance threshold
 * @returns {boolean}
 */
export function isPointNearLineMidpoint(point, lineStart, lineEnd, threshold) {
  const midX = (lineStart.x + lineEnd.x) / 2;
  const midY = (lineStart.y + lineEnd.y) / 2;
  const dx = point.x - midX;
  const dy = point.y - midY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < threshold;
}

/**
 * Normalize event coordinates to canvas space
 * @param {Event} event - Mouse or touch event
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {Object} Normalized coordinates {x, y}
 */
export function normalizeEventCoordinates(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  let clientX, clientY;
  
  // Handle touch events
  if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else if (event.changedTouches && event.changedTouches.length > 0) {
    clientX = event.changedTouches[0].clientX;
    clientY = event.changedTouches[0].clientY;
  } else {
    // Mouse events
    clientX = event.clientX;
    clientY = event.clientY;
  }
  
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  
  return { x, y };
}

/**
 * Calculate responsive canvas dimensions
 * @param {number} containerWidth - Container width
 * @param {boolean} isMobile - Whether device is mobile
 * @returns {Object} Canvas dimensions {width, height}
 */
export function calculateCanvasDimensions(containerWidth, isMobile) {
  const maxWidth = 800;
  const padding = 32;
  const width = Math.min(containerWidth - padding, maxWidth);
  const height = isMobile ? Math.min(width * 0.8, 400) : 400;
  
  return { width, height };
}

/**
 * Constants for geometric calculations
 */
export const GEOMETRY_CONSTANTS = {
  CITY_RADIUS: 20,
  CONNECTION_CLICK_THRESHOLD: 30,
  DRAG_THRESHOLD: 10,
  LONG_PRESS_DURATION: 500
};