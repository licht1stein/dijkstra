# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file React application that implements an interactive logistics route optimizer using Dijkstra's algorithm. The entire application is contained in `app.js` with no build configuration or package management.

## Current Project State

- **No package.json**: This project lacks npm/yarn configuration
- **No build tools**: No webpack, vite, or other bundlers configured
- **Single file architecture**: All code is in `app.js` (654 lines)
- **No git repository**: Directory is not version controlled

## Setting Up Development Environment

To make this a functional React development project, you'll need to:

```bash
# Initialize npm project
npm init -y

# Install dependencies
npm install react react-dom lucide-react

# Install dev dependencies (example with Vite)
npm install -D vite @vitejs/plugin-react

# Create index.html entry point
# Create vite.config.js
# Move app.js to src/App.jsx
```

## Code Architecture

### Main Component: DijkstraLogisticsApp

The application uses React hooks for state management:
- `cities`: Array of city nodes with {id, name, x, y}
- `connections`: Array of edges with {from, to, weight}
- `shortestPath`: Result of Dijkstra's algorithm calculation

### Key Features
1. **Interactive Canvas**: Click to add cities, drag to create connections
2. **Inline Editing**: Click connection weights to edit them directly
3. **Dijkstra's Algorithm**: Implemented in `dijkstra()` function (lines 58-125)
4. **Visual Feedback**: Color-coded cities and highlighted shortest path

### Interaction Patterns
- **Left Click**: Add city or select connection for editing
- **Drag**: Create connection between cities
- **Right Click**: Remove city and its connections
- **Hover**: Visual feedback on connections and cities

## Dependencies Used

The app imports:
- React (with hooks: useState, useRef, useEffect)
- Lucide React icons (AlertCircle, Navigation, MapPin)
- Tailwind CSS classes (inline styling)

## Canvas Rendering

The app uses HTML5 Canvas API for visualization (lines 335-452):
- Draws connections as lines with weight labels
- Renders cities as colored circles
- Updates on every state change via useEffect

## State Management Approach

Uses local component state with useState hooks. Key state updates:
- City/connection modifications trigger full canvas re-render
- Hover states tracked separately for performance
- Edit mode managed through `editingConnection` state