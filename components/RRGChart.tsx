
import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { TickerData, Quadrant } from '../types';
import { QUADRANT_COLORS } from '../constants';

interface RRGChartProps {
  data: TickerData[];
  trailLength: number;
}

const RRGChart: React.FC<RRGChartProps> = ({ data, trailLength }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 40, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Determine domains based on data
    const allPoints = data.flatMap(d => d.history.slice(-trailLength));
    const xExtent = d3.extent(allPoints, p => p.rsRatio) as [number, number];
    const yExtent = d3.extent(allPoints, p => p.rsMomentum) as [number, number];

    // Padding for scales
    const xPadding = (xExtent[1] - xExtent[0]) * 0.2 || 2;
    const yPadding = (yExtent[1] - yExtent[0]) * 0.2 || 2;

    const xScale = d3.scaleLinear()
      .domain([Math.min(96, xExtent[0] - xPadding), Math.max(104, xExtent[1] + xPadding)])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([Math.min(96, yExtent[0] - yPadding), Math.max(104, yExtent[1] + yPadding)])
      .range([innerHeight, 0]);

    // Draw Quadrants
    const drawQuadrantRect = (x1: number, x2: number, y1: number, y2: number, color: string, label: string) => {
      g.append('rect')
        .attr('x', xScale(x1))
        .attr('y', yScale(y2))
        .attr('width', Math.abs(xScale(x2) - xScale(x1)))
        .attr('height', Math.abs(yScale(y1) - yScale(y2)))
        .attr('fill', color)
        .attr('opacity', 0.05);

      g.append('text')
        .attr('x', xScale(x1 + (x2 - x1) / 2))
        .attr('y', yScale(y1 + (y2 - y1) / 2))
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('fill', color)
        .attr('opacity', 0.25)
        .attr('font-size', '24px')
        .attr('font-weight', 'bold')
        .attr('letter-spacing', '2px')
        .text(label.toUpperCase());
    };

    const xDomain = xScale.domain();
    const yDomain = yScale.domain();

    drawQuadrantRect(100, xDomain[1], 100, yDomain[1], QUADRANT_COLORS[Quadrant.LEADING], Quadrant.LEADING);
    drawQuadrantRect(100, xDomain[1], yDomain[0], 100, QUADRANT_COLORS[Quadrant.WEAKENING], Quadrant.WEAKENING);
    drawQuadrantRect(xDomain[0], 100, yDomain[0], 100, QUADRANT_COLORS[Quadrant.LAGGING], Quadrant.LAGGING);
    drawQuadrantRect(xDomain[0], 100, 100, yDomain[1], QUADRANT_COLORS[Quadrant.IMPROVING], Quadrant.IMPROVING);

    // Draw Axes (100, 100 crossing)
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(100))
      .attr('y2', yScale(100))
      .attr('stroke', '#475569')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');

    g.append('line')
      .attr('x1', xScale(100))
      .attr('x2', xScale(100))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#475569')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');

    // Axes Ticks
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d => d.toString()))
      .attr('color', '#94a3b8');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(10).tickFormat(d => d.toString()))
      .attr('color', '#94a3b8');

    // Draw Tails and Heads
    data.forEach(ticker => {
      const history = ticker.history.slice(-trailLength);
      const lastPoint = history[history.length - 1];
      const color = QUADRANT_COLORS[ticker.currentQuadrant];
      
      // Line width based on distance from 100, 100
      const strokeWidth = Math.max(1, Math.min(4, ticker.distanceFromCenter * 0.8));

      // Draw Path
      const lineGenerator = d3.line<any>()
        .x(d => xScale(d.rsRatio))
        .y(d => yScale(d.rsMomentum))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(history)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth)
        .attr('opacity', 0.6)
        .attr('d', lineGenerator);

      // Draw trail dots
      g.selectAll(`.dot-${ticker.symbol}`)
        .data(history.slice(0, -1))
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.rsRatio))
        .attr('cy', d => yScale(d.rsMomentum))
        .attr('r', 2)
        .attr('fill', color)
        .attr('opacity', 0.4);

      // Draw Head
      const head = g.append('g')
        .attr('transform', `translate(${xScale(lastPoint.rsRatio)},${yScale(lastPoint.rsMomentum)})`);

      head.append('circle')
        .attr('r', 6)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);

      head.append('text')
        .attr('x', 10)
        .attr('y', -10)
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
        .text(ticker.symbol);
    });

    // Axis Labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .text('JdK RS-Ratio (Trend)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .text('JdK RS-Momentum (Rate of Change)');

  }, [data, trailLength]);

  return (
    <div className="w-full h-full relative bg-slate-900/50 rounded-xl border border-slate-700 p-4 shadow-inner">
      <svg ref={svgRef} className="w-full h-full overflow-visible" />
    </div>
  );
};

export default RRGChart;
