# Dijkstra's Algorithm Visualizer

An interactive web application for visualizing Dijkstra's shortest path algorithm.

## Features

- 🎯 Click to create cities (nodes)
- 🔗 Drag between cities to create connections
- ✏️ Click on connection weights to edit them
- 🚀 Calculate shortest path between selected cities
- 💾 Automatic state persistence with localStorage
- 🔄 Reset canvas functionality

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

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Lucide React Icons
- GitHub Actions for CI/CD