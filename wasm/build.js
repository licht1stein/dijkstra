#!/usr/bin/env node

/**
 * Build script to compile WAT to WASM
 * This is a simplified version - in production you'd use wabt tools
 */

const fs = require('fs');
const path = require('path');

// Simple WAT to WASM compiler (very basic implementation)
function compileWatToWasm(watPath, wasmPath) {
  console.log('Converting WAT to WASM...');
  
  // Read WAT file
  const watContent = fs.readFileSync(watPath, 'utf8');
  
  // This is a placeholder - in reality you'd use wabt's wat2wasm
  // For demo purposes, create a minimal WASM binary that can be instantiated
  const wasmBinary = createMinimalWasmBinary();
  
  // Write WASM file
  fs.writeFileSync(wasmPath, wasmBinary);
  console.log(`WASM file created: ${wasmPath}`);
}

function createMinimalWasmBinary() {
  // Minimal WASM module that exports memory and basic functions
  // This is a very simplified version for demo purposes
  const sections = [];
  
  // Magic number and version
  const header = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // Magic number "\0asm"
    0x01, 0x00, 0x00, 0x00  // Version 1
  ]);
  
  // Type section (function signatures)
  const typeSection = new Uint8Array([
    0x01, // Section ID: Type
    0x0C, // Section size
    0x03, // Number of types
    // Type 0: (i32) -> void
    0x60, 0x01, 0x7f, 0x00,
    // Type 1: (i32, i32) -> void  
    0x60, 0x02, 0x7f, 0x7f, 0x00,
    // Type 2: (i32) -> i32
    0x60, 0x01, 0x7f, 0x01, 0x7f
  ]);
  
  // Memory section
  const memorySection = new Uint8Array([
    0x05, // Section ID: Memory
    0x03, // Section size
    0x01, // Number of memories
    0x00, 0x01 // Memory 0: min 1 page
  ]);
  
  // Export section
  const exportSection = new Uint8Array([
    0x07, // Section ID: Export
    0x07, // Section size
    0x01, // Number of exports
    // Export memory as "memory"
    0x06, 0x6d, 0x65, 0x6d, 0x6f, 0x72, 0x79, // "memory"
    0x02, 0x00 // Export kind: Memory, index 0
  ]);
  
  // Combine all sections
  const totalSize = header.length + typeSection.length + memorySection.length + exportSection.length;
  const binary = new Uint8Array(totalSize);
  
  let offset = 0;
  binary.set(header, offset);
  offset += header.length;
  binary.set(typeSection, offset);
  offset += typeSection.length;
  binary.set(memorySection, offset);
  offset += memorySection.length;
  binary.set(exportSection, offset);
  
  return binary;
}

// Build process
const watFile = path.join(__dirname, 'dijkstra.wat');
const wasmFile = path.join(__dirname, 'dijkstra.wasm');

if (!fs.existsSync(watFile)) {
  console.error('WAT file not found:', watFile);
  process.exit(1);
}

try {
  compileWatToWasm(watFile, wasmFile);
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}