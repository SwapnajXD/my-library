"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";

export interface Media {
  id: string;
  title: string;
  poster?: string;
  creator?: string;
  sequelId?: string | null;
  progress?: number;
  total?: number;
}

type NodeState = {
  id: string;
  title: string;
  poster?: string;
  type: "creator" | "media";
  creatorId?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed?: boolean;
  progress?: number;
  total?: number;
};

type LinkState = { source: string; target: string; type: "creator" | "sequel" };

interface Props {
  items: Media[];
  onSelectNode?: (id: string | null) => void;
}

export default function Graph({ items = [], onSelectNode }: Props) {
  const FRICTION = 0.82;
  const GRID_STEP = 250;
  const JITTER_FREQ = 0.002;
  const JITTER_STRENGTH = 0.08;
  const REPULSION_DIST = 100;
  const REPULSION_STRENGTH = 0.9;
  const CREATOR_SNAP_STRENGTH = 0.2;
  const CREATOR_TO_MEDIA_DIST = 160;
  const SEQUEL_DIST = 90;
  const SEQUEL_SPRING = 0.08;
  const CREATOR_SPRING = 0.05;
  const CENTRIFUGAL_STRENGTH = 0.12;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const nodesRef = useRef<Map<string, NodeState>>(new Map());
  const linksRef = useRef<LinkState[]>([]);
  const [tick, setTick] = useState(0);

  const viewRef = useRef({ x: 0, y: 0 });
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const [zoom, setZoom] = useState(1);

  const draggingNodeRef = useRef<string | null>(null);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const nodeStartRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const pointerPanStartRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef<string | null>(null);

  const buildGraph = useCallback(() => {
    nodesRef.current.clear();
    linksRef.current = [];

    const creators = new Map<string, string>();
    items.forEach((m) => {
      const cname = m.creator || "UNKNOWN";
      if (!creators.has(cname)) creators.set(cname, `creator-${creators.size}`);
    });

    let idx = 0;
    const cols = Math.max(1, Math.ceil(Math.sqrt(creators.size)));
    for (const [name, id] of creators.entries()) {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = col * GRID_STEP;
      const y = row * GRID_STEP;
      nodesRef.current.set(id, {
        id,
        title: name.toUpperCase(),
        type: "creator",
        x,
        y,
        vx: 0,
        vy: 0,
      });
      idx++;
    }

    items.forEach((m, i) => {
      const creatorName = m.creator || "UNKNOWN";
      const creatorId = creators.get(creatorName) || `creator-0`;
      const nodeId = String(m.id || `media-${i}`);
      const cnode = nodesRef.current.get(creatorId)!;
      const angle = (i / Math.max(1, items.length)) * Math.PI * 2;
      const x = (cnode?.x ?? 0) + Math.cos(angle) * CREATOR_TO_MEDIA_DIST;
      const y = (cnode?.y ?? 0) + Math.sin(angle) * CREATOR_TO_MEDIA_DIST;
      nodesRef.current.set(nodeId, {
        id: nodeId,
        title: m.title,
        poster: m.poster,
        type: "media",
        creatorId,
        progress: m.progress,
        total: m.total,
        x,
        y,
        vx: 0,
        vy: 0,
      });
      linksRef.current.push({ source: creatorId, target: nodeId, type: "creator" });
    });

    items.forEach((m) => {
      if (!m.sequelId) return;
      const a = String(m.id);
      const b = String(m.sequelId);
      if (!nodesRef.current.has(a) || !nodesRef.current.has(b)) return;
      linksRef.current.push({ source: a, target: b, type: "sequel" });
    });

    setTick((t) => t + 1);
  }, [items]);

  useEffect(() => {
    buildGraph();
    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      viewRef.current.x = cx * -1;
      viewRef.current.y = cy * -1;
      setViewOffset({ x: viewRef.current.x, y: viewRef.current.y });
    }
  }, [buildGraph]);

  useEffect(() => {
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(50, now - last) / 16.6667;
      last = now;

      const nodes = Array.from(nodesRef.current.values());
      const links = linksRef.current;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.fixed) continue;

        const jitter = Math.cos(Date.now() * JITTER_FREQ + i) * JITTER_STRENGTH;
        n.vx = n.vx * FRICTION + jitter;
        n.vy = n.vy * FRICTION + jitter * 0.7;

        if (n.type === "creator") {
          const snapX = Math.round(n.x / GRID_STEP) * GRID_STEP;
          const snapY = Math.round(n.y / GRID_STEP) * GRID_STEP;
          n.vx += (snapX - n.x) * CREATOR_SNAP_STRENGTH * dt;
          n.vy += (snapY - n.y) * CREATOR_SNAP_STRENGTH * dt;
        }

        for (let j = 0; j < links.length; j++) {
          const l = links[j];
          if (l.source !== n.id && l.target !== n.id) continue;
          const otherId = l.source === n.id ? l.target : l.source;
          const other = nodesRef.current.get(otherId);
          if (!other) continue;
          const dx = other.x - n.x;
          const dy = other.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          const desired = l.type === "sequel" ? SEQUEL_DIST : CREATOR_TO_MEDIA_DIST;
          const spring = l.type === "sequel" ? SEQUEL_SPRING : CREATOR_SPRING;
          const force = (dist - desired) * spring;
          n.vx += (dx / dist) * force * dt;
          n.vy += (dy / dist) * force * dt;

          if (n.type === "media" && other.type === "creator") {
            n.vx += (-dx / dist) * CENTRIFUGAL_STRENGTH * dt;
            n.vy += (-dy / dist) * CENTRIFUGAL_STRENGTH * dt;
          }
        }

        for (let k = 0; k < nodes.length; k++) {
          if (k === i) continue;
          const other = nodes[k];
          const dx = n.x - other.x;
          const dy = n.y - other.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < REPULSION_DIST * REPULSION_DIST && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const strength = (n.type === "media" && other.type === "media") ? REPULSION_STRENGTH * 1.5 : REPULSION_STRENGTH;
            if (dist < REPULSION_DIST) {
              const push = (REPULSION_DIST - dist) / REPULSION_DIST;
              n.vx += (dx / dist) * strength * push * dt;
              n.vy += (dy / dist) * strength * push * dt;
            }
          }
        }
      }

      for (const n of nodes) {
        if (n.fixed) continue;
        if (draggingNodeRef.current === n.id) continue;
        n.x += n.vx;
        n.y += n.vy;
        nodesRef.current.set(n.id, n);
      }

      if ((performance.now() / 16) % 2 < 1) setTick((t) => t + 1);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const toSvgPoint = (clientX: number, clientY: number) => {
      const rect = svg.getBoundingClientRect();
      const x = (clientX - rect.left - viewOffset.x) / zoomRef.current;
      const y = (clientY - rect.top - viewOffset.y) / zoomRef.current;
      return { x, y };
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as Element;
      const nodeId = target.getAttribute?.("data-node-id");
      if (nodeId) {
        draggingNodeRef.current = nodeId;
        const p = toSvgPoint(e.clientX, e.clientY);
        pointerStartRef.current = { x: p.x, y: p.y };
        const n = nodesRef.current.get(nodeId)!;
        nodeStartRef.current = { x: n.x, y: n.y };
        const node = nodesRef.current.get(nodeId);
        if (node) node.fixed = true;
        try { onSelectNode?.(nodeId); } catch (err) { }
      } else {
        isPanningRef.current = true;
        pointerPanStartRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (draggingNodeRef.current) {
        const id = draggingNodeRef.current;
        const p = toSvgPoint(e.clientX, e.clientY);
        const dx = p.x - pointerStartRef.current.x;
        const dy = p.y - pointerStartRef.current.y;
        const n = nodesRef.current.get(id);
        if (n) {
          n.x = nodeStartRef.current.x + dx;
          n.y = nodeStartRef.current.y + dy;
          n.vx = 0; n.vy = 0;
          nodesRef.current.set(id, n);
          setTick((t) => t + 1);
        }
      } else if (isPanningRef.current) {
        const dx = e.clientX - pointerPanStartRef.current.x;
        const dy = e.clientY - pointerPanStartRef.current.y;
        viewRef.current.x += dx;
        viewRef.current.y += dy;
        pointerPanStartRef.current = { x: e.clientX, y: e.clientY };
        setViewOffset({ x: viewRef.current.x, y: viewRef.current.y });
      }
    };

    const onPointerUp = (_e: PointerEvent) => {
      if (draggingNodeRef.current) {
        const n = nodesRef.current.get(draggingNodeRef.current!);
        if (n) n.fixed = false;
        draggingNodeRef.current = null;
      }
      isPanningRef.current = false;
    };

    svg.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      svg.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [viewOffset, onSelectNode]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const delta = -e.deltaY;
      const factor = Math.exp(delta * 0.0015);
      const newZoom = Math.max(0.1, Math.min(3, zoomRef.current * factor));
      const mx = cx;
      const my = cy;
      viewRef.current.x = mx - (mx - viewRef.current.x) * (newZoom / zoomRef.current);
      viewRef.current.y = my - (my - viewRef.current.y) * (newZoom / zoomRef.current);
      zoomRef.current = newZoom;
      setZoom(newZoom);
      setViewOffset({ x: viewRef.current.x, y: viewRef.current.y });
    };
    svg.addEventListener("wheel", onWheel, { passive: false } as any);
    return () => svg.removeEventListener("wheel", onWheel as any);
  }, []);

  const handleNodeEnter = (id: string) => { hoverRef.current = id; setTick(t => t + 1); };
  const handleNodeLeave = () => { hoverRef.current = null; setTick(t => t + 1); };

  const nodes = Array.from(nodesRef.current.values());
  const links = linksRef.current;

  const pulseStyle = `@keyframes pulseDash { 0% { stroke-dashoffset: 0 } 50% { stroke-dashoffset: -12 } 100% { stroke-dashoffset: 0 } }`;

  return (
    <div className="h-full bg-[#0b0b0b] rounded-xl overflow-hidden">
      <style>{pulseStyle}</style>
      <div className="absolute z-20 right-14 bottom-14 flex flex-col gap-2">
        <button onClick={() => { const z = Math.min(3, zoomRef.current * 1.2); zoomRef.current = z; setZoom(z); }} className="p-3 bg-white/5 rounded-xl text-white hover:bg-white/10"><ZoomIn size={16} /></button>
        <button onClick={() => { const z = Math.max(0.1, zoomRef.current * 0.8); zoomRef.current = z; setZoom(z); }} className="p-3 bg-white/5 rounded-xl text-white hover:bg-white/10"><ZoomOut size={16} /></button>
        <button onClick={() => { zoomRef.current = 1; setZoom(1); viewRef.current = { x: 0, y: 0 }; setViewOffset({ x: 0, y: 0 }); }} className="p-3 bg-white/5 rounded-xl text-white hover:bg-white/10"><Maximize2 size={16} /></button>
      </div>

      <svg ref={svgRef} width="100%" height="100%" className="absolute inset-0 rounded-xl" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="minorGrid" width={50} height={50} patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
          </pattern>
          <pattern id="majorGrid" width={GRID_STEP} height={GRID_STEP} patternUnits="userSpaceOnUse">
            <rect width={GRID_STEP} height={GRID_STEP} fill="url(#minorGrid)" />
            <path d={`M ${GRID_STEP} 0 L 0 0 0 ${GRID_STEP}`} fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
          </pattern>

          {nodes.map((n) => n.poster ? (
            <pattern id={`p-${n.id}`} key={`p-${n.id}`} patternUnits="userSpaceOnUse" width={70} height={70} viewBox={`0 0 70 70`}>
              <image href={n.poster} x="0" y="0" width="70" height="70" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          ) : null)}
        </defs>

        <g transform={`translate(${viewOffset.x}, ${viewOffset.y}) scale(${zoom})`}>
          <rect x={-10000} y={-10000} width={20000} height={20000} fill="url(#majorGrid)" />

          <g>
            {links.map((l, i) => {
              const s = nodesRef.current.get(l.source);
              const t = nodesRef.current.get(l.target);
              if (!s || !t || !isFinite(s.x) || !isFinite(s.y) || !isFinite(t.x) || !isFinite(t.y)) return null;
              const isConnected = hoverRef.current ? (hoverRef.current === s.id || hoverRef.current === t.id) : false;
              if (l.type === "sequel") {
                return (
                  <g key={i}>
                    <line x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                      stroke="#FB923C" strokeWidth={3.5}
                      strokeDasharray="6 6"
                      strokeOpacity={hoverRef.current ? (isConnected ? 1 : 0.2) : 0.95}
                      style={{ animation: 'pulseDash 2s linear infinite' }}
                    />
                  </g>
                );
              }
              return (
                <g key={i}>
                  <line x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                    stroke="#ffffff" strokeWidth={2} strokeOpacity={hoverRef.current ? (isConnected ? 1 : 0.08) : 0.35}
                  />
                </g>
              );
            })}
          </g>

          <g>
            {nodes.map((n) => {
              const connected = hoverRef.current ?
                links.some(l => (l.source === hoverRef.current && (l.target === n.id)) || (l.target === hoverRef.current && (l.source === n.id))) : true;

              return (
                <g key={n.id} transform={`translate(${n.x}, ${n.y})`} style={{ pointerEvents: 'auto' }} onPointerEnter={() => handleNodeEnter(n.id)} onPointerLeave={handleNodeLeave}>
                  {n.type === "creator" ? (
                    <>
                      <circle r={36} fill="#000000" stroke="#ffffff" strokeWidth={2} opacity={connected ? 1 : 0.12} data-node-id={n.id} style={{ cursor: 'pointer', pointerEvents: 'auto' }} />
                      <text x={0} y={4} textAnchor="middle" fill="#ffffff" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace', fontStyle: 'italic', fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', pointerEvents: 'none' }}>{String(n.title).toUpperCase()}</text>
                    </>
                  ) : (
                    <>
                      <circle r={38} fill="#000000" stroke="#ffffff" strokeWidth={1.5} opacity={connected ? 1 : 0.06} data-node-id={n.id} style={{ cursor: 'grab', pointerEvents: 'auto' }} />
                      {n.poster ? (
                        <circle r={34} fill={`url(#p-${n.id})`} strokeOpacity={0.95} style={{ pointerEvents: 'none' }} />
                      ) : (
                        <circle r={34} fill="#111827" style={{ pointerEvents: 'none' }} />
                      )}
                      {n.progress !== undefined && n.total !== undefined && n.total > 0 && (
                        <g style={{ pointerEvents: 'none' }}>
                          <rect x={-28} y={42} width={56} height={6} rx={2} fill="#1f2937" opacity={0.8} />
                          <rect x={-28} y={42} width={56 * (n.progress / n.total)} height={6} rx={2}
                            fill={n.progress >= n.total ? "#10b981" : "#3b82f6"} opacity={0.95}
                            style={{ transition: 'width 0.3s ease' }}
                          />
                          <text x={0} y={57} textAnchor="middle" fill="#e5e7eb" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 10, fontWeight: 500, pointerEvents: 'none' }}>
                            {Math.round((n.progress / n.total) * 100)}%
                          </text>
                        </g>
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}
