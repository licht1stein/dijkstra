# Creating a Demo GIF

## Recording Steps

1. **Open the live demo**: https://licht1stein.github.io/dijkstra/
2. **Record the following sequence**:
   - Create 8-10 cities by clicking around the canvas
   - Click "Randomize Connections" to generate a network
   - Select start city (e.g., A)
   - Select end city (e.g., H)
   - Click "Calculate Shortest Path"
   - Show the highlighted path
   - Change implementation from "Auto" to "JavaScript" 
   - Calculate again to show it works with both implementations
   - Demonstrate touch/mobile by using smaller screen

## Tools for Recording

### macOS
```bash
# Using QuickTime Player
# File → New Screen Recording

# Or using ffmpeg (if installed)
ffmpeg -f avfoundation -i "1" -r 30 -t 30 demo.mov

# Convert to GIF
ffmpeg -i demo.mov -vf "fps=10,scale=800:-1:flags=lanczos" demo.gif
```

### Linux
```bash
# Using byzanz
byzanz-record -d 30 -x 0 -y 0 -w 1200 -h 800 demo.gif

# Or using ffmpeg
ffmpeg -f x11grab -s 1200x800 -r 25 -i :0.0+0,0 -t 30 demo.mp4
ffmpeg -i demo.mp4 -vf "fps=10,scale=800:-1:flags=lanczos" demo.gif
```

### Windows
```bash
# Using OBS Studio or built-in Game Bar
# Win + G to open Game Bar
# Then convert with ffmpeg:
ffmpeg -i demo.mp4 -vf "fps=10,scale=800:-1:flags=lanczos" demo.gif
```

## Recommended Settings
- **Duration**: 20-30 seconds
- **Resolution**: 800-1000px wide
- **Frame rate**: 10 fps for GIF
- **File size**: Under 5MB for GitHub

## Demo Script
1. **0-3s**: Show empty canvas, create 6-8 cities
2. **3-6s**: Click "Randomize Connections", show network
3. **6-10s**: Select start city A, end city G
4. **10-13s**: Click "Calculate Shortest Path", highlight route
5. **13-16s**: Change to "JavaScript" implementation
6. **16-19s**: Calculate again, show same result
7. **19-22s**: Quick demonstration of editing a connection weight

## After Recording
1. Place the GIF in the repository root as `demo.gif`
2. Update README.md to include the GIF
3. Commit and push