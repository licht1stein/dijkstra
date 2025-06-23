# Dijkstra's Algorithm Route Optimizer

An interactive logistics route optimizer using Dijkstra's shortest path algorithm. Built with Preact for optimal performance and vanilla CSS for a clean, responsive design.

🌐 **Live Demo**: [https://licht1stein.github.io/dijkstra/](https://licht1stein.github.io/dijkstra/)

## Features

- 🎯 **Interactive Canvas**: Click/tap to create cities (nodes)
- 🔗 **Smart Connections**: Drag between cities to create weighted routes
- ✏️ **Weight Editing**: Click connection weights to modify them
- 📱 **Touch Support**: Full mobile compatibility with long-press gestures
- 🚀 **Shortest Path**: Real-time route optimization using Dijkstra's algorithm  
- 💾 **Persistence**: Auto-saves state to localStorage
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
- **Vanilla CSS** - Custom styling with CSS variables and responsive design
- **Vite** - Fast build tool and development server
- **GitHub Actions** - Automated CI/CD deployment

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
└── styles/            # Vanilla CSS modules
    ├── main.css       # Base styles & variables
    ├── components.css # Component styles
    └── buttons.css    # Button styles
```

### Key Design Patterns
- **Separated Business Logic**: Core algorithms isolated from UI
- **Mobile-First Design**: Touch-friendly with responsive layouts  
- **Performance Optimized**: Preact reduces bundle size by ~93% vs React
- **Framework-Agnostic Core**: Business logic can be reused in any framework