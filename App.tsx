import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Period, TickerData, MarketInsight, Quadrant } from './types';
import { INITIAL_TRAIL_LENGTH, QUADRANT_COLORS } from './constants';
import { getRealSectorRotationData } from './services/dataService';
import { getMarketInsights } from './services/geminiService';
import RRGChart from './components/RRGChart';

const App: React.FC = () => {
  const [period, setPeriod] = useState<Period>(Period.WEEK);
  const [trailLength, setTrailLength] = useState<number>(INITIAL_TRAIL_LENGTH);
  const [tickerData, setTickerData] = useState<TickerData[]>([]);
  const [insights, setInsights] = useState<MarketInsight | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize and Fetch Real Data
  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const data = await getRealSectorRotationData(trailLength, period);
      setTickerData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch market data from Yahoo Finance.");
    } finally {
      setIsLoadingData(false);
    }
  }, [trailLength, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle AI Insights
  const generateInsights = useCallback(async () => {
    if (tickerData.length === 0) return;
    setIsLoadingInsights(true);
    const result = await getMarketInsights(tickerData);
    setInsights(result);
    setIsLoadingInsights(false);
  }, [tickerData]);

  // Initial insight fetch once data is ready
  useEffect(() => {
    if (tickerData.length > 0 && !insights && !isLoadingData) {
      generateInsights();
    }
  }, [tickerData, insights, isLoadingData, generateInsights]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      {/* Loading Overlay */}
      {isLoadingData && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Fetching Market Data</h2>
            <p className="text-slate-400 text-sm animate-pulse uppercase tracking-widest">Period: {period} • Syncing with Yahoo Finance...</p>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fas fa-chart-line text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">QuantRotate <span className="text-indigo-400">RRG</span></h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Live Sector Rotation Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50">
          <div className="flex bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
            {(Object.values(Period) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                  period === p 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-700 mx-2"></div>

          <div className="flex items-center gap-3 px-2">
            <label className="text-xs font-medium text-slate-400 whitespace-nowrap">Trail: {trailLength}</label>
            <input 
              type="range" 
              min="5" 
              max="60" 
              value={trailLength} 
              onChange={(e) => setTrailLength(parseInt(e.target.value))}
              className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          
          <button 
            onClick={fetchData}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Refresh Market Data"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column: Chart */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center gap-3 text-rose-400">
                <i className="fas fa-exclamation-circle text-lg"></i>
                <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center">
             <div className="flex gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-xs font-medium text-slate-400 uppercase">Leading</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-xs font-medium text-slate-400 uppercase">Weakening</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-xs font-medium text-slate-400 uppercase">Lagging</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-xs font-medium text-slate-400 uppercase">Improving</span>
                </div>
             </div>
             <button 
                onClick={() => setShowTable(!showTable)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
             >
                <i className={`fas ${showTable ? 'fa-chart-pie' : 'fa-list'} mr-2`}></i>
                {showTable ? 'View Chart' : 'View Data'}
             </button>
          </div>

          <div className="flex-1 min-h-[500px] relative">
            {showTable ? (
                <div className="w-full h-full overflow-auto bg-slate-900/50 rounded-xl border border-slate-700 shadow-xl p-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="py-3 px-4 font-semibold">Symbol</th>
                                <th className="py-3 px-4 font-semibold">Name</th>
                                <th className="py-3 px-4 font-semibold">Quadrant</th>
                                <th className="py-3 px-4 text-right font-semibold">RS-Ratio</th>
                                <th className="py-3 px-4 text-right font-semibold">RS-Mom</th>
                                <th className="py-3 px-4 text-right font-semibold">Distance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickerData.map(ticker => {
                                const last = ticker.history[ticker.history.length - 1];
                                return (
                                    <tr key={ticker.symbol} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-4 px-4 font-bold font-mono text-white">{ticker.symbol}</td>
                                        <td className="py-4 px-4 text-slate-300">{ticker.name}</td>
                                        <td className="py-4 px-4">
                                            <span 
                                                className="px-2 py-1 rounded text-[10px] font-bold uppercase"
                                                style={{ backgroundColor: `${QUADRANT_COLORS[ticker.currentQuadrant]}20`, color: QUADRANT_COLORS[ticker.currentQuadrant], border: `1px solid ${QUADRANT_COLORS[ticker.currentQuadrant]}40` }}
                                            >
                                                {ticker.currentQuadrant}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right text-slate-300">{last.rsRatio.toFixed(2)}</td>
                                        <td className="py-4 px-4 text-right text-slate-300">{last.rsMomentum.toFixed(2)}</td>
                                        <td className="py-4 px-4 text-right font-medium text-indigo-400">{ticker.distanceFromCenter.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <RRGChart data={tickerData} trailLength={trailLength} />
            )}
          </div>
        </div>

        {/* Right Column: Insights & Legend */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          {/* AI Insights Card */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <i className="fas fa-robot text-4xl text-indigo-500"></i>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-bold text-white">Market Intelligence</h2>
                <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] font-bold text-indigo-400 tracking-wider">GEMINI AI</div>
            </div>

            {isLoadingInsights ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded w-full"></div>
                <div className="h-20 bg-slate-800 rounded w-full"></div>
              </div>
            ) : insights ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <i className="fas fa-bullseye text-[10px]"></i> Summary
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-indigo-500/30 pl-4 py-1">
                    "{insights.summary}"
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fas fa-rocket text-[10px]"></i> Top Performers
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.topSectors.map(s => (
                      <span key={s} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle text-[10px]"></i> Risk View
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {insights.riskAssessment}
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                    <i className="fas fa-chess text-[10px]"></i> Strategy Output
                  </h3>
                  <p className="text-sm font-medium text-slate-200">
                    {insights.rotationStrategy}
                  </p>
                </div>

                <button 
                    onClick={generateInsights}
                    disabled={isLoadingData}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-bold text-slate-300 border border-slate-700 transition-all active:scale-95"
                >
                    <i className="fas fa-sync-alt mr-2"></i> Refresh Analysis
                </button>
              </div>
            ) : (
              <div className="py-10 text-center">
                <button 
                    onClick={generateInsights}
                    disabled={isLoadingData || tickerData.length === 0}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-bold text-white transition-all shadow-lg shadow-indigo-600/20"
                >
                    Analyze Rotation
                </button>
              </div>
            )}
          </section>

          {/* Education Card */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle text-slate-400"></i> RRG Methodology
            </h2>
            <div className="space-y-3">
                <div className="flex gap-3">
                    <div className="w-1.5 rounded-full bg-green-500 shrink-0"></div>
                    <div className="text-[11px] leading-relaxed">
                        <span className="font-bold text-green-400 block mb-0.5">LEADING (+RS, +MOM)</span>
                        Sectors are outperforming the benchmark with strong upward momentum.
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="w-1.5 rounded-full bg-yellow-500 shrink-0"></div>
                    <div className="text-[11px] leading-relaxed">
                        <span className="font-bold text-yellow-400 block mb-0.5">WEAKENING (+RS, -MOM)</span>
                        Sectors still outperforming but losing relative momentum; potential peak.
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="w-1.5 rounded-full bg-red-500 shrink-0"></div>
                    <div className="text-[11px] leading-relaxed">
                        <span className="font-bold text-red-400 block mb-0.5">LAGGING (-RS, -MOM)</span>
                        Sectors underperforming with weak momentum. Avoid or short bias.
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="w-1.5 rounded-full bg-blue-500 shrink-0"></div>
                    <div className="text-[11px] leading-relaxed">
                        <span className="font-bold text-blue-400 block mb-0.5">IMPROVING (-RS, +MOM)</span>
                        Sectors underperforming but momentum is turning; early recovery signal.
                    </div>
                </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-2 text-[10px] text-slate-500 flex justify-between items-center">
        <div className="flex gap-4">
            <span>Benchmark: <b>SPY (S&P 500 ETF)</b></span>
            <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Source: Yahoo Finance
            </span>
        </div>
        <div className="font-mono">
            LAST REFRESH: {new Date().toLocaleTimeString()}
        </div>
      </footer>
    </div>
  );
};

export default App;
