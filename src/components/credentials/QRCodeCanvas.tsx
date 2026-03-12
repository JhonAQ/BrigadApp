"use client";

import { useEffect, useRef } from "react";

interface QRCodeCanvasProps {
  value: string;
  size?: number;
}

/**
 * Simple QR-like visual placeholder using a deterministic pattern from the value.
 * For a production app, use a proper QR code library like `qrcode.react`.
 */
export default function QRCodeCanvas({ value, size = 80 }: QRCodeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const MODULES = 21;
    const cellSize = Math.floor(size / MODULES);
    const actualSize = cellSize * MODULES;
    canvas.width = actualSize;
    canvas.height = actualSize;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, actualSize, actualSize);

    // Generate deterministic bit matrix from value
    const matrix = generateMatrix(value, MODULES);

    ctx.fillStyle = "#000000";
    for (let row = 0; row < MODULES; row++) {
      for (let col = 0; col < MODULES; col++) {
        if (matrix[row][col]) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: "pixelated", display: "block" }}
    />
  );
}

function generateMatrix(value: string, modules: number): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: modules }, () =>
    new Array(modules).fill(false)
  );

  // Hash the value for deterministic pattern
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  // Fill interior with pseudo-random pattern
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      const seed = (hash ^ (r * 37 + c * 17)) >>> 0;
      matrix[r][c] = (seed % 3) !== 0;
    }
  }

  // Draw 3 finder patterns (top-left, top-right, bottom-left)
  drawFinder(matrix, 0, 0);
  drawFinder(matrix, 0, modules - 7);
  drawFinder(matrix, modules - 7, 0);

  // Quiet zones around finders
  for (let i = 0; i < 9; i++) {
    safeSet(matrix, 7, i, false, modules);
    safeSet(matrix, i, 7, false, modules);
    safeSet(matrix, modules - 8, i, false, modules);
    safeSet(matrix, i, modules - 8, false, modules);
    safeSet(matrix, 7, modules - 1 - i, false, modules);
  }

  return matrix;
}

function drawFinder(matrix: boolean[][], row: number, col: number) {
  // 7x7 finder pattern
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const onEdge = r === 0 || r === 6 || c === 0 || c === 6;
      const onInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      matrix[row + r][col + c] = onEdge || onInner;
    }
  }
}

function safeSet(
  matrix: boolean[][],
  row: number,
  col: number,
  value: boolean,
  modules: number
) {
  if (row >= 0 && row < modules && col >= 0 && col < modules) {
    matrix[row][col] = value;
  }
}
