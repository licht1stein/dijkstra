import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { GEOMETRY_CONSTANTS } from '../core/geometry';

export function Canvas({ 
  graph, 
  dimensions, 
  dragLine, 
  hoveredCity,
  selectedConnection,
  shortestPath,
  startCity,
  endCity,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
  onContextMenu
}) {
  const canvasRef = useRef(null);
  
  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cities = graph.getCities();
    const connections = graph.getConnections();
    
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
        let isInPath = false;
        if (shortestPath && shortestPath.path.length > 0) {
          const pathIndex = shortestPath.path.indexOf(conn.from);
          if (pathIndex !== -1) {
            if (shortestPath.path[pathIndex + 1] === conn.to ||
                shortestPath.path[pathIndex - 1] === conn.to) {
              isInPath = true;
            }
          }
        }
        
        if (isInPath) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = isSelected ? 5 : 3;
        } else {
          ctx.strokeStyle = isSelected ? '#f59e0b' : '#6b7280';
          ctx.lineWidth = isSelected ? 3 : 1;
        }
        
        ctx.stroke();
        
        // Draw weight label
        const midX = (fromCity.x + toCity.x) / 2;
        const midY = (fromCity.y + toCity.y) / 2;
        
        ctx.fillStyle = isSelected ? '#f59e0b' : '#1f2937';
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
      ctx.arc(city.x, city.y, GEOMETRY_CONSTANTS.CITY_RADIUS, 0, 2 * Math.PI);
      
      // Different colors for different states
      if (city.id === startCity) {
        ctx.fillStyle = '#3b82f6';
      } else if (city.id === endCity) {
        ctx.fillStyle = '#ef4444';
      } else if (city.id === hoveredCity) {
        ctx.fillStyle = '#8b5cf6';
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
  }, [graph, dragLine, hoveredCity, selectedConnection, shortestPath, startCity, endCity]);
  
  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className={`canvas ${dragLine ? 'canvas--dragging' : ''}`}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerLeave}
        onTouchStart={(e) => {
          e.preventDefault();
          onPointerDown(e);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          onPointerMove(e);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onPointerUp(e);
        }}
        onContextMenu={onContextMenu}
      />
      {graph.getCities().length === 0 && (
        <div className="canvas-empty-state">
          <div className="canvas-empty-state__content">
            <svg className="canvas-empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>Click to add cities (max 10)</p>
          </div>
        </div>
      )}
    </div>
  );
}