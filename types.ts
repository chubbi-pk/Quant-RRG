
export enum Quadrant {
  LEADING = 'Leading',
  WEAKENING = 'Weakening',
  LAGGING = 'Lagging',
  IMPROVING = 'Improving'
}

export interface RRGPoint {
  rsRatio: number;
  rsMomentum: number;
  timestamp: string;
}

export interface TickerData {
  symbol: string;
  name: string;
  history: RRGPoint[];
  currentQuadrant: Quadrant;
  distanceFromCenter: number;
  color: string;
}

export enum Period {
  FIVE_MIN = '5m',
  FIFTEEN_MIN = '15m',
  HOUR = '1h',
  DAY = '1d',
  WEEK = '1w',
  MONTH = '1M'
}

export interface MarketInsight {
  summary: string;
  topSectors: string[];
  riskAssessment: string;
  rotationStrategy: string;
}
