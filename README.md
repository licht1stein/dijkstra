# Dijkstra's Algorithm Route Optimizer

An interactive logistics route optimizer using Dijkstra's shortest path algorithm implemented in both **WebAssembly** and **JavaScript**. Built with Preact for optimal performance and vanilla CSS for a clean, responsive design.

> **Note**: This is an exploratory repository demonstrating AI-assisted development with [Claude Code](https://claude.ai/code).

🌐 **Live Demo**: [https://licht1stein.github.io/dijkstra/](https://licht1stein.github.io/dijkstra/)

## Demo

![Demo Video](./img/dijkstra.mp4)

## Features

- 🎯 **Interactive Canvas**: Click/tap to create unlimited cities with smart naming (A-Z, AA-ZZ, AAA-ZZZ)
- 🔗 **Smart Connections**: Drag between cities to create weighted routes
- ✏️ **Weight Editing**: Click connection weights to modify them
- 📱 **Touch Support**: Full mobile compatibility with long-press gestures
- 🚀 **Dual Implementation**: Choose between WebAssembly and JavaScript algorithms
- ⚡ **WebAssembly Performance**: High-speed pathfinding for large networks
- 🎲 **Network Generator**: "Randomize Connections" creates complex, realistic route networks
- 💾 **Persistence**: Auto-saves state and preferences to localStorage
- 🔄 **Reset Function**: Clear canvas and start fresh
- 📐 **Responsive Design**: Works seamlessly on all screen sizes

## Live Demo

This app is automatically deployed to GitHub Pages when you push to the `master` or `main` branch.

## Setup for GitHub Pages

1. **Create a GitHub repository** and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin master
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"

3. **Wait for deployment**:
   - The GitHub Action will automatically run when you push
   - Check the Actions tab to monitor the deployment
   - Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Architecture

### Tech Stack
- **Preact** (~3KB) - Lightweight React alternative for optimal performance
- **WebAssembly** - High-performance algorithm implementation with JavaScript fallback
- **Vanilla CSS** - Custom styling with CSS variables and responsive design
- **Vite** - Fast build tool and development server
- **GitHub Actions** - Automated CI/CD deployment

### Project Structure
```
src/
├── core/              # Business logic modules
│   ├── dijkstra.js    # JavaScript implementation
│   ├── dijkstra-wasm.js # WebAssembly implementation with fallback
│   ├── graph.js       # Graph data structure with unlimited cities
│   ├── geometry.js    # Coordinate calculations
│   └── storage.js     # LocalStorage persistence
├── components/        # Preact components
│   ├── App.jsx        # Main application with dual algorithms
│   ├── Canvas.jsx     # Canvas rendering
│   ├── Controls.jsx   # Control panel with implementation selector
│   └── ConnectionEditor.jsx
├── styles/            # Vanilla CSS modules
│   ├── main.css       # Base styles & variables
│   ├── components.css # Component styles
│   └── buttons.css    # Button styles
└── wasm/              # WebAssembly module
    ├── dijkstra.wasm  # Compiled WebAssembly binary
    ├── dijkstra.wat   # WebAssembly text format
    └── build.js       # Build tooling
```

### Key Design Patterns
- **Dual Algorithm Architecture**: WebAssembly + JavaScript implementations with automatic fallback
- **Separated Business Logic**: Core algorithms isolated from UI components
- **Intelligent Network Generation**: Creates realistic, complex route topologies
- **Mobile-First Design**: Touch-friendly with responsive layouts  
- **Performance Optimized**: Preact reduces bundle size by ~93% vs React
- **Framework-Agnostic Core**: Business logic can be reused in any framework

## Advanced Features

### WebAssembly Implementation
- **High Performance**: Optimized pathfinding for networks with hundreds of cities
- **Automatic Fallback**: Gracefully falls back to JavaScript if WASM fails to load
- **User Choice**: Manual selection between implementations via dropdown
- **Performance Monitoring**: Real-time indication of active implementation

### Smart Network Generation
- **Realistic Topologies**: Creates networks resembling real logistics/transportation systems
- **Guaranteed Connectivity**: Ensures all cities are reachable via spanning tree algorithm
- **Complex Routing**: Multiple path options between cities for interesting optimization scenarios
- **Distance-Weighted Connections**: Shorter routes more likely, with strategic long-distance alternatives
- **Scalable**: Works efficiently from small (5 cities) to large (100+ cities) networks

### Unlimited City Support
- **Smart Naming**: Automatic progression from A-Z → AA-ZZ → AAA-ZZZ → City1, City2...
- **No Artificial Limits**: Create as many cities as your device can handle
- **Performance Scaling**: WebAssembly implementation maintains speed with large networks