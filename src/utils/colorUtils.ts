// Color utility functions for the Magic Number palette generator

// Define the luminance ranges for each grade
export const LUMINANCE_RANGES = [
  { grade: 0, min: 1.000, max: 1.000 },
  { grade: 5, min: 0.850, max: 0.930 },
  { grade: 10, min: 0.750, max: 0.820 },
  { grade: 20, min: 0.500, max: 0.650 },
  { grade: 30, min: 0.350, max: 0.450 },
  { grade: 40, min: 0.225, max: 0.300 },
  { grade: 50, min: 0.175, max: 0.183 },
  { grade: 60, min: 0.100, max: 0.125 },
  { grade: 70, min: 0.050, max: 0.070 },
  { grade: 80, min: 0.020, max: 0.040 },
  { grade: 90, min: 0.005, max: 0.015 },
  { grade: 100, min: 0.000, max: 0.000 },
];

export const GRADES = [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// Color conversion utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return { h, s, l };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Calculate relative luminance according to WCAG
export function calculateLuminance(r: number, g: number, b: number): number {
  const rsrgb = r / 255;
  const gsrgb = g / 255;
  const bsrgb = b / 255;

  const r1 = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
  const g1 = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
  const b1 = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);

  return 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
}

// Calculate contrast ratio between two colors
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const luminance1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
  const luminance2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Find the closest grades to a luminance value
export function findNeighboringGrades(luminance: number): { lowerGrade: number | null; higherGrade: number | null } {
  let lowerGrade = null;
  let higherGrade = null;

  // Sort ranges by min luminance (descending)
  const sortedRanges = [...LUMINANCE_RANGES].sort((a, b) => b.min - a.min);

  for (let i = 0; i < sortedRanges.length; i++) {
    if (luminance > sortedRanges[i].min) {
      higherGrade = i > 0 ? sortedRanges[i-1].grade : null;
      lowerGrade = sortedRanges[i].grade;
      break;
    }
  }

  // If we didn't find a lower grade, it means the luminance is lower than the lowest grade
  if (lowerGrade === null) {
    lowerGrade = sortedRanges[sortedRanges.length - 1].grade;
  }

  return { lowerGrade, higherGrade };
}

// Determine the grade based on luminance
export function determineGrade(luminance: number): { grade: number; exact: boolean; lowerGrade?: number | null; higherGrade?: number | null } {
  for (const range of LUMINANCE_RANGES) {
    if (luminance >= range.min && luminance <= range.max) {
      return { grade: range.grade, exact: true };
    }
  }

  // If no exact match, find the closest grade
  let closestGrade = 50; // Default to middle grade
  let minDifference = Number.MAX_VALUE;

  for (const range of LUMINANCE_RANGES) {
    const midRange = (range.min + range.max) / 2;
    const difference = Math.abs(luminance - midRange);
    
    if (difference < minDifference) {
      minDifference = difference;
      closestGrade = range.grade;
    }
  }

  const { lowerGrade, higherGrade } = findNeighboringGrades(luminance);

  return { 
    grade: closestGrade, 
    exact: false,
    lowerGrade: lowerGrade,
    higherGrade: higherGrade 
  };
}

// Adjust saturation to create more pleasant, pastel-like colors with perfectly smooth transitions
function adjustSaturationForPastel(saturation: number, luminance: number, grade: number): number {
  // Handle edge cases
  if (grade === 0 || grade === 100) {
    return 0; // Pure white and black
  }
  
  // Ensure we have a reasonable base saturation to work with
  const baseSaturation = Math.max(saturation, 0.08);
  
  // Create a single, completely smooth curve with no conditional branches
  // This eliminates ALL discontinuities between grades
  const normalizedGrade = grade / 100; // Convert to 0-1 range
  
  // Use a very gentle exponential curve that creates natural, smooth progression
  // The curve starts very low for light colors and gradually increases
  const smoothCurve = Math.pow(normalizedGrade, 1.6); // Gentle exponential curve
  
  // Apply a second smoothing function to make the transition even more gradual
  const ultraSmoothFactor = normalizedGrade * normalizedGrade * normalizedGrade; // Cubic curve for extra smoothness
  
  // Blend the two curves for maximum smoothness
  const blendedFactor = (smoothCurve * 0.7) + (ultraSmoothFactor * 0.3);
  
  // Saturation multiplier: very gentle progression from 0.45 to 0.8
  const saturationMultiplier = 0.45 + (blendedFactor * 0.35);
  
  // Maximum saturation: gentle progression from 0.4 to 0.7
  const maxSaturation = 0.4 + (blendedFactor * 0.3);
  
  return Math.min(baseSaturation * saturationMultiplier, maxSaturation);
}

// Generate a color with specific luminance while creating pleasant pastel tones
export function generateColorWithLuminance(hue: number, saturation: number, targetLuminance: number, grade?: number): string {
  // Adjust saturation for more pleasant, pastel-like colors
  const adjustedSaturation = grade !== undefined ? adjustSaturationForPastel(saturation, targetLuminance, grade) : saturation;
  
  // Better initial estimation based on target luminance
  let low = 0;
  let high = 1;
  
  // Improved starting point calculation
  let mid;
  if (targetLuminance > 0.9) {
    mid = 0.95; // Very light colors
  } else if (targetLuminance > 0.7) {
    mid = 0.85; // Light colors
  } else if (targetLuminance > 0.3) {
    mid = 0.6; // Medium colors
  } else if (targetLuminance > 0.1) {
    mid = 0.4; // Dark colors
  } else {
    mid = 0.2; // Very dark colors
  }
  
  let iterations = 0;
  const maxIterations = 30; // Increased for better precision
  
  // More precise tolerance for better color accuracy
  let tolerance = 0.001;
  if (grade !== undefined) {
    if (grade <= 20) {
      tolerance = 0.002; // Tighter tolerance for light colors to avoid over-brightening
    } else if (grade <= 40) {
      tolerance = 0.001; // Standard tolerance for medium colors
    }
  }

  while (iterations < maxIterations) {
    const rgb = hslToRgb(hue, adjustedSaturation, mid);
    const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b);
    
    if (Math.abs(luminance - targetLuminance) < tolerance) {
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    }
    
    if (luminance > targetLuminance) {
      high = mid;
    } else {
      low = mid;
    }
    
    mid = (low + high) / 2;
    iterations++;
  }

  const finalRgb = hslToRgb(hue, adjustedSaturation, mid);
  return rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b);
}

// Generate the full palette based on the input color
export function generatePalette(hexColor: string): { palette: Array<{ grade: number; color: string; luminance: number; isInputColor: boolean }>; inputGradeInfo: ReturnType<typeof determineGrade> } {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return { palette: [], inputGradeInfo: { grade: 50, exact: false } };

  const inputLuminance = calculateLuminance(rgb.r, rgb.g, rgb.b);
  const inputGradeInfo = determineGrade(inputLuminance);
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const palette = [];

  for (const range of LUMINANCE_RANGES) {
    // If this is the grade that matches our input color exactly, use the input color
    if (range.grade === inputGradeInfo.grade && inputGradeInfo.exact) {
      palette.push({
        grade: range.grade,
        color: hexColor.toUpperCase(),
        luminance: inputLuminance,
        isInputColor: true
      });
      continue;
    }
    
    // For very light colors, target closer to the minimum to avoid over-lightening
    // For darker colors, use the middle of the range
    let targetLuminance: number;
    if (range.grade <= 20) {
      // For light colors, target 25% from min to max (closer to min)
      targetLuminance = range.min + (range.max - range.min) * 0.25;
    } else if (range.grade <= 40) {
      // For medium-light colors, target 40% from min to max
      targetLuminance = range.min + (range.max - range.min) * 0.4;
    } else {
      // For darker colors, use the middle of the range
      targetLuminance = (range.min + range.max) / 2;
    }
    
    // For grade 0, always use white (#FFFFFF)
    if (range.grade === 0) {
      palette.push({
        grade: 0,
        color: "#FFFFFF",
        luminance: 1.000,
        isInputColor: false
      });
      continue;
    }
    
    // For grade 100, always use black (#000000)
    if (range.grade === 100) {
      palette.push({
        grade: 100,
        color: "#000000",
        luminance: 0.000,
        isInputColor: false
      });
      continue;
    }
    
    const color = generateColorWithLuminance(h, s, targetLuminance, range.grade);
    const actualRgb = hexToRgb(color);
    const actualLuminance = actualRgb ? calculateLuminance(actualRgb.r, actualRgb.g, actualRgb.b) : 0;
    
    palette.push({
      grade: range.grade,
      color,
      luminance: actualLuminance,
      isInputColor: false
    });
  }

  return { palette, inputGradeInfo };
}

// Format and validate hex input
export function formatHexInput(input: string): string {
  // Remove all # symbols
  let formattedInput = input.replace(/#/g, '');

  // Add a single # at the beginning
  formattedInput = '#' + formattedInput;

  // Convert to uppercase
  return formattedInput.toUpperCase();
}

// Validate hex color
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6})$/.test(hex);
}