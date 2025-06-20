# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Preact-based interactive logistics route optimizer using Dijkstra's algorithm. The application features a clean architecture with separated business logic and UI components, using vanilla CSS for styling.

## Architecture

### Project Structure
```
src/
├── core/              # Business logic modules
│   ├── dijkstra.js    # Shortest path algorithm
│   ├── graph.js       # Graph data structure
│   ├── geometry.js    # Coordinate calculations
│   └── storage.js     # LocalStorage persistence
├── components/        # Preact components
│   ├── App.jsx        # Main application
│   ├── Canvas.jsx     # Canvas rendering
│   ├── Controls.jsx   # Control panel
│   └── ConnectionEditor.jsx
├── styles/            # Vanilla CSS modules
│   ├── main.css       # Base styles & variables
│   ├── components.css # Component styles
│   └── buttons.css    # Button styles
└── main.jsx          # Entry point
```

## Tech Stack

- **Preact** (~3KB) - Lightweight React alternative
- **Vanilla CSS** - No build-time CSS processing
- **Vite** - Fast build tool
- **No external UI libraries** - Custom components

## Development Commands

```bash
npm install    # Install dependencies
npm run dev    # Start development server
npm run build  # Build for production
```

## Key Design Patterns

### Business Logic Separation
- Core modules are framework-agnostic
- Graph operations isolated in `graph.js`
- Algorithm implementation in `dijkstra.js`
- Geometry calculations in `geometry.js`

### State Management
- Preact hooks for local state
- LocalStorage for persistence
- Graph instance manages data structure

### CSS Architecture
- CSS variables for theming
- BEM-inspired naming
- Mobile-first responsive design
- Component-scoped styles

## Key Features

1. **Interactive Canvas**: Click/tap to add cities, drag to connect
2. **Touch Support**: Full mobile compatibility with long-press
3. **Weight Editing**: Click connections to edit weights
4. **Dijkstra's Algorithm**: Finds shortest paths efficiently
5. **Persistence**: Auto-saves state to localStorage
6. **Responsive**: Works on all screen sizes

## Performance Optimizations

- Preact instead of React (~93% smaller)
- No CSS-in-JS or build-time CSS processing
- Efficient canvas rendering with minimal redraws
- Modular code splitting potential