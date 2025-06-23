#!/bin/bash

# Demo capture script for Dijkstra Route Optimizer
echo "🎬 Demo Capture Script for Dijkstra Route Optimizer"
echo "=================================================="

# Check if ffmpeg is available
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg not found. Please install ffmpeg first."
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt install ffmpeg"
    exit 1
fi

echo "📋 Demo Instructions:"
echo "1. Open: https://licht1stein.github.io/dijkstra/"
echo "2. Create 8-10 cities by clicking around"
echo "3. Click 'Randomize Connections'"
echo "4. Select start and end cities"
echo "5. Click 'Calculate Shortest Path'"
echo "6. Change implementation dropdown"
echo "7. Calculate again"
echo ""
echo "🎯 Target: 20-30 second demo"
echo ""

read -p "Press Enter when ready to start recording (3 second countdown)..."

echo "Starting in 3..."
sleep 1
echo "2..."
sleep 1  
echo "1..."
sleep 1
echo "🔴 Recording! (30 seconds)"

# Detect OS and record accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "🍎 macOS detected - using avfoundation"
    ffmpeg -f avfoundation -i "1" -r 30 -t 30 -y demo.mov
    echo "🎬 Converting to GIF..."
    ffmpeg -i demo.mov -vf "fps=10,scale=800:-1:flags=lanczos,palettegen" -y palette.png
    ffmpeg -i demo.mov -i palette.png -lavfi "fps=10,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse" -y demo.gif
    rm palette.png demo.mov
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "🐧 Linux detected - using x11grab"
    echo "Click on the browser window to focus it..."
    sleep 3
    ffmpeg -f x11grab -s 1200x800 -r 25 -i :0.0 -t 30 -y demo.mp4
    echo "🎬 Converting to GIF..."
    ffmpeg -i demo.mp4 -vf "fps=10,scale=800:-1:flags=lanczos,palettegen" -y palette.png
    ffmpeg -i demo.mp4 -i palette.png -lavfi "fps=10,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse" -y demo.gif
    rm palette.png demo.mp4
else
    echo "❌ Unsupported OS. Please record manually and convert with:"
    echo "   ffmpeg -i your_recording.mp4 -vf \"fps=10,scale=800:-1:flags=lanczos\" demo.gif"
    exit 1
fi

echo ""
echo "✅ Demo recording complete!"
echo "📁 File: demo.gif"

# Check file size
if [ -f "demo.gif" ]; then
    size=$(du -h demo.gif | cut -f1)
    echo "📊 File size: $size"
    
    if [ $(du -k demo.gif | cut -f1) -gt 5120 ]; then
        echo "⚠️  Warning: File is larger than 5MB. Consider compressing:"
        echo "   ffmpeg -i demo.gif -vf \"fps=8,scale=600:-1:flags=lanczos\" demo_compressed.gif"
    fi
    
    echo ""
    echo "🚀 Next steps:"
    echo "1. Review demo.gif"
    echo "2. Add to README.md: ![Demo](demo.gif)"
    echo "3. git add demo.gif && git commit -m 'Add demo GIF' && git push"
else
    echo "❌ Recording failed. Please try manual recording."
fi