#!/bin/bash

# Convert MP4 demo to optimized GIF for README
echo "🎬 Converting dijkstra.mp4 to optimized GIF..."

# Check if ffmpeg is available
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg not found. Please install ffmpeg first."
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt install ffmpeg"
    exit 1
fi

# Check if input file exists
if [ ! -f "img/dijkstra.mp4" ]; then
    echo "❌ img/dijkstra.mp4 not found"
    exit 1
fi

echo "📊 Original file size:"
du -h img/dijkstra.mp4

# Create optimized GIF
echo "🔄 Converting to GIF..."

# Generate palette for better quality
ffmpeg -i img/dijkstra.mp4 -vf "fps=10,scale=800:-1:flags=lanczos,palettegen" -y img/palette.png

# Create GIF with palette
ffmpeg -i img/dijkstra.mp4 -i img/palette.png -lavfi "fps=10,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse" -y img/dijkstra.gif

# Clean up palette
rm img/palette.png

echo "✅ Conversion complete!"
echo "📊 New file size:"
du -h img/dijkstra.gif

# Check if under 10MB (GitHub limit)
size_kb=$(du -k img/dijkstra.gif | cut -f1)
if [ $size_kb -gt 10240 ]; then
    echo "⚠️  Warning: GIF is larger than 10MB. Creating compressed version..."
    ffmpeg -i img/dijkstra.gif -vf "fps=8,scale=600:-1:flags=lanczos" -y img/dijkstra_compressed.gif
    echo "📊 Compressed file size:"
    du -h img/dijkstra_compressed.gif
    echo "💡 Consider using dijkstra_compressed.gif if the original is too large"
else
    echo "✅ GIF size is good for GitHub!"
fi

echo ""
echo "🚀 Next steps:"
echo "1. git add img/dijkstra.gif"
echo "2. git commit -m 'Add demo GIF'"
echo "3. git push"