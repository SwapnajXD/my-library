"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export interface Media {
  id: string;
  genres?: string[];
  status?: string;
}

interface Props {
  items: Media[];
}

export default function Charts({ items = [] }: Props) {
  const genreChartRef = useRef<SVGSVGElement | null>(null);
  const statusChartRef = useRef<SVGSVGElement | null>(null);

  const genreCounts = items.reduce((acc: Record<string, number>, item) => {
    item.genres?.forEach((g: string) => acc[g] = (acc[g] || 0) + 1);
    return acc;
  }, {});

  const statusCounts = items.reduce((acc: Record<string, number>, item) => {
    acc[item.status || "Unknown"] = (acc[item.status || "Unknown"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    const data = Object.entries(genreCounts).map(([k, v]) => ({ key: k || 'Unknown', value: v }));
    const svg = d3.select(genreChartRef.current as any);
    svg.selectAll("*").remove();
    const width = 540;
    const height = 300;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const margin = { top: 20, right: 20, bottom: 60, left: 60 } as const;
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const x = d3.scaleBand().domain(data.map(d => d.key)).range([0, innerW]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) || 1]).nice().range([innerH, 0]);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g').call(d3.axisLeft(y).ticks(5).tickSizeOuter(0)).selectAll('text').attr('fill', '#9CA3AF');

    g.append('g').attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-35)')
      .style('text-anchor', 'end')
      .attr('fill', '#9CA3AF');

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.key) || 0)
      .attr('y', innerH)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', '#0EA5E9')
      .transition()
      .duration(600)
      .attr('y', d => y(d.value))
      .attr('height', d => innerH - y(d.value));

    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (x(d.key) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#E5E7EB')
      .style('font-size', '11px')
      .text(d => d.value);

  }, [genreCounts]);

  useEffect(() => {
    const data = Object.entries(statusCounts).map(([k, v]) => ({ key: k, value: v }));
    const svg = d3.select(statusChartRef.current as any);
    svg.selectAll('*').remove();
    const width = 300;
    const height = 300;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    const radius = Math.min(width, height) / 2 - 10;
    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal<string>().domain(data.map(d => d.key)).range(['#0EA5E9', '#F472B6', '#34D399', '#FBBF24', '#A78BFA']);
    const pie = d3.pie<any>().value((d: any) => d.value).sort(null);
    const arc = d3.arc<any>().innerRadius(radius * 0.45).outerRadius(radius);

    const arcs = g.selectAll('arc').data(pie(data)).enter().append('g').attr('class', 'arc');
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => color(d.data.key))
      .attr('stroke', '#0b0b0b')
      .attr('stroke-width', 1)
      .transition().duration(600)
      .attrTween('d', function(d: any) {
        const i = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d);
        return (t: number) => arc(i(t)) as string;
      });

    const legend = svg.append('g').attr('transform', `translate(${10},${10})`);
    legend.selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`)
      .call((g) => {
        g.append('rect').attr('width', 12).attr('height', 12).attr('fill', (d: any) => color(d.key));
        g.append('text').attr('x', 18).attr('y', 10).attr('fill', '#9CA3AF').text((d: any) => `${d.key} (${d.value})`).style('font-size', '12px');
      });
  }, [statusCounts]);

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500">Genre Distribution</h3>
          <div className="bg-[#050505] p-4 rounded-xl border border-neutral-900">
            <svg ref={genreChartRef as any} className="w-full h-75" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500">Status Distribution</h3>
          <div className="bg-[#050505] p-4 rounded-xl border border-neutral-900 flex items-center justify-center">
            <svg ref={statusChartRef as any} className="w-75 h-75" />
          </div>
        </div>
      </div>
    </div>
  );
}
