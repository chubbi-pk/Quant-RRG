
import { Quadrant } from './types';

export const SECTORS = [
  { symbol: 'XLK', name: 'Technology', color: '#60a5fa' },
  { symbol: 'XLU', name: 'Utilities', color: '#fbbf24' },
  { symbol: 'XLE', name: 'Energy', color: '#f87171' },
  { symbol: 'XLC', name: 'Communication', color: '#a78bfa' },
  { symbol: 'XLB', name: 'Materials', color: '#fb923c' },
  { symbol: 'XLP', name: 'Consumer Staples', color: '#34d399' },
  { symbol: 'XLRE', name: 'Real Estate', color: '#f472b6' },
  { symbol: 'XLY', name: 'Consumer Discretionary', color: '#818cf8' },
  { symbol: 'XLI', name: 'Industrials', color: '#94a3b8' },
  { symbol: 'XLV', name: 'Health Care', color: '#2dd4bf' },
  { symbol: 'XLF', name: 'Financials', color: '#fb7185' }
];

export const QUADRANT_COLORS = {
  [Quadrant.LEADING]: '#22c55e',   // Green
  [Quadrant.WEAKENING]: '#eab308', // Yellow
  [Quadrant.LAGGING]: '#ef4444',   // Red
  [Quadrant.IMPROVING]: '#3b82f6'  // Blue
};

export const INITIAL_TRAIL_LENGTH = 12;
