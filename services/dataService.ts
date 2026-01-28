
import { TickerData, RRGPoint, Quadrant, Period } from '../types';
import { SECTORS } from '../constants';

const PROXY_URL = 'https://corsproxy.io/?';
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';

interface YahooChartResult {
  timestamp: number[];
  indicators: {
    quote: [{ close: (number | null)[] }];
  };
}

/**
 * Maps our Period enum to Yahoo Finance's range and interval parameters.
 */
const getParamsForPeriod = (period: Period): { range: string; interval: string } => {
  switch (period) {
    case Period.FIVE_MIN:
      return { range: '5d', interval: '5m' };
    case Period.FIFTEEN_MIN:
      return { range: '5d', interval: '15m' };
    case Period.HOUR:
      return { range: '1mo', interval: '1h' };
    case Period.DAY:
      return { range: '1y', interval: '1d' };
    case Period.WEEK:
      return { range: '5y', interval: '1wk' };
    case Period.MONTH:
      return { range: 'max', interval: '1mo' };
    default:
      return { range: '1y', interval: '1d' };
  }
};

/**
 * Fetches historical data from Yahoo Finance for a specific symbol
 */
const fetchYahooData = async (symbol: string, period: Period): Promise<Map<number, number>> => {
  const { range, interval } = getParamsForPeriod(period);
  const url = `${YAHOO_BASE}${symbol}?range=${range}&interval=${interval}`;
  
  try {
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const json = await response.json();
    if (!json.chart || !json.chart.result) throw new Error("Invalid response format");
    
    const result: YahooChartResult = json.chart.result[0];
    const timestamps = result.timestamp || [];
    const closes = result.indicators.quote[0].close || [];
    
    const dataMap = new Map<number, number>();
    for (let i = 0; i < timestamps.length; i++) {
      const price = closes[i];
      if (price !== null && price !== undefined) {
        dataMap.set(timestamps[i], price);
      }
    }
    
    return dataMap;
  } catch (error) {
    console.error(`Failed to fetch data for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Calculates JdK RS-Ratio and RS-Momentum from raw prices
 */
const calculateRRG = (sectorPrices: number[], benchmarkPrices: number[]): RRGPoint[] => {
  // 1. Calculate Ratio (Relative Strength)
  const ratio = sectorPrices.map((p, i) => p / benchmarkPrices[i]);
  
  // 2. RS-Ratio calculation (Approximate JdK using SMA 14)
  const n = 14;
  const rsRatio: number[] = [];
  for (let i = n; i < ratio.length; i++) {
    const window = ratio.slice(i - n, i);
    const avg = window.reduce((a, b) => a + b, 0) / n;
    rsRatio.push(avg);
  }

  if (rsRatio.length === 0) return [];

  // Normalize RS-Ratio around 100
  const avgRsRatio = rsRatio.reduce((a, b) => a + b, 0) / rsRatio.length;
  const normalizedRsRatio = rsRatio.map(v => (v / avgRsRatio) * 100);

  // 3. RS-Momentum calculation (Rate of Change of RS-Ratio)
  const m = 10;
  const rrgPoints: RRGPoint[] = [];
  
  for (let i = m; i < normalizedRsRatio.length; i++) {
    const current = normalizedRsRatio[i];
    const prev = normalizedRsRatio[i - m];
    
    // Calculate momentum based on the slope of the RS-Ratio
    const momentum = 100 + ((current - prev) / prev) * 500; 

    rrgPoints.push({
      rsRatio: current,
      rsMomentum: momentum,
      timestamp: new Date().toISOString()
    });
  }

  return rrgPoints;
};

export const getRealSectorRotationData = async (trailLength: number, period: Period): Promise<TickerData[]> => {
  // Fetch Benchmark (SPY) first
  let benchmarkMap: Map<number, number>;
  try {
    benchmarkMap = await fetchYahooData('SPY', period);
  } catch (e) {
    throw new Error("Could not fetch benchmark data (SPY). " + e);
  }
  
  const results = await Promise.all(
    SECTORS.map(async (sector) => {
      try {
        const sectorMap = await fetchYahooData(sector.symbol, period);
        
        // Align data by common timestamps
        const commonTimestamps = Array.from(sectorMap.keys())
          .filter(t => benchmarkMap.has(t))
          .sort((a, b) => a - b);
        
        if (commonTimestamps.length < 30) {
          console.warn(`Insufficient overlapping data for ${sector.symbol} at period ${period}`);
          return null;
        }

        const alignedSectorPrices = commonTimestamps.map(t => sectorMap.get(t)!);
        const alignedBenchmarkPrices = commonTimestamps.map(t => benchmarkMap.get(t)!);
        
        const history = calculateRRG(alignedSectorPrices, alignedBenchmarkPrices);
        if (history.length === 0) return null;

        const lastPoint = history[history.length - 1];
        
        let currentQuadrant = Quadrant.LAGGING;
        if (lastPoint.rsRatio >= 100 && lastPoint.rsMomentum >= 100) currentQuadrant = Quadrant.LEADING;
        else if (lastPoint.rsRatio >= 100 && lastPoint.rsMomentum < 100) currentQuadrant = Quadrant.WEAKENING;
        else if (lastPoint.rsRatio < 100 && lastPoint.rsMomentum >= 100) currentQuadrant = Quadrant.IMPROVING;
        
        const dx = lastPoint.rsRatio - 100;
        const dy = lastPoint.rsMomentum - 100;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

        return {
          ...sector,
          history,
          currentQuadrant,
          distanceFromCenter,
        };
      } catch (e) {
        console.error(`Skipping ${sector.symbol} due to error:`, e);
        return null;
      }
    })
  );

  const filteredResults = results.filter(r => r !== null) as TickerData[];
  if (filteredResults.length === 0) {
    throw new Error(`No sector data could be retrieved for period: ${period}.`);
  }

  return filteredResults;
};
