"use client";

import { useMediaStore } from "@/store/mediaStore";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { 
  RefreshCw, Maximize2, Search, Database, 
  X, ExternalLink, Cpu, Terminal, Eye, EyeOff, ZoomIn, ZoomOut
} from "lucide-react";

interface Node {
  id: string;
  label: string;
  type: 'creator' | 'media';
  poster?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  creatorId?: string;
  isMatch?: boolean;
  isFixed?: boolean;
  isStatic?: boolean;
}

interface Link {
  sourceId: string;
  targetId: string;
}

export function RelationshipGraph() {
  const { media } = useMediaStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Navigation State
  const [zoom, setZoom] = useState(0.4); // Start zoomed out for large datasets
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isIsolated, setIsIsolated] = useState(false);

  const dragTargetId = useRef<string | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(null);

  // Large Dataset Constants
  const WIDTH = 3000; // Expanded workspace for 600 nodes
  const HEIGHT = 2000;
  const FRICTION = 0.75; 
  const REPULSION = 1200; 
  const ATTRACTION = 0.015;
  const GRID_SIZE = 100; 

  const initializeGraph = useCallback(() => {
    if (!media.length) return;
    const initNodes: Node[] = [];
    const initLinks: Link[] = [];
    const creators: Record<string, string[]> = {};

    media.forEach(m => {
      const c = m.creator || "Unknown";
      if (!creators[c]) creators[c] = [];
      creators[c].push(m.id);
    });

    const creatorEntries = Object.entries(creators);
    creatorEntries.forEach(([c, items], idx) => {
      const cId = `creator-${c}`;
      // Spread creators across a much wider area
      const centerX = (WIDTH / (creatorEntries.length + 1)) * (idx + 1);
      const centerY = HEIGHT / 2;

      initNodes.push({ 
        id: cId, label: c, type: 'creator', 
        x: centerX, y: centerY, 
        vx: 0, vy: 0, isFixed: false, isStatic: true 
      });

      items.forEach(id => {
        const item = media.find(m => m.id === id);
        initNodes.push({ 
          id, label: item?.title || "", type: 'media', poster: item?.poster, 
          creatorId: cId,
          x: centerX + (Math.random() - 0.5) * 600, 
          y: centerY + (Math.random() - 0.5) * 600, 
          vx: 0, vy: 0, isFixed: false, isStatic: false
        });
        initLinks.push({ sourceId: cId, targetId: id });
      });
    });
    setNodes(initNodes);
    setLinks(initLinks);
    setViewOffset({ x: 0, y: 0 });
  }, [media]);

  useEffect(() => { initializeGraph(); }, [initializeGraph]);

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.001;
    const delta = -e.deltaY;
    const newZoom = Math.min(Math.max(zoom + delta * zoomSpeed, 0.1), 3);
    setZoom(newZoom);
  };

  const updatePhysics = () => {
    setNodes(prev => {
      const next = prev.map(n => ({ ...n }));
      // Optimization: Only run physics on non-static nodes
      const activeNodes = next.filter(n => !n.isStatic && !n.isFixed);
      
      for (let i = 0; i < next.length; i++) {
        for (let j = i + 1; j < next.length; j++) {
          const dx = next[i].x - next[j].x;
          const dy = next[i].y - next[j].y;
          const distSq = dx * dx + dy * dy + 1;
          if (distSq > 100000) continue; // Skip distant nodes for 600+ node perf
          
          const force = REPULSION / distSq;
          if (!next[i].isStatic && !next[i].isFixed) {
            next[i].vx += (dx / Math.sqrt(distSq)) * force;
            next[i].vy += (dy / Math.sqrt(distSq)) * force;
          }
          if (!next[j].isStatic && !next[j].isFixed) {
            next[j].vx -= (dx / Math.sqrt(distSq)) * force;
            next[j].vy -= (dy / Math.sqrt(distSq)) * force;
          }
        }
      }

      links.forEach(l => {
        const s = next.find(n => n.id === l.sourceId);
        const t = next.find(n => n.id === l.targetId);
        if (s && t) {
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 180) * ATTRACTION;
          if (!s.isStatic && !s.isFixed) { s.vx += (dx / dist) * force; s.vy += (dy / dist) * force; }
          if (!t.isStatic && !t.isFixed) { t.vx -= (dx / dist) * force; t.vy -= (dy / dist) * force; }
        }
      });

      return next.map(n => {
        if (n.isStatic || n.isFixed) return n;
        n.vx *= FRICTION; n.vy *= FRICTION;
        n.x = Math.max(100, Math.min(WIDTH - 100, n.x + n.vx));
        n.y = Math.max(100, Math.min(HEIGHT - 100, n.y + n.vy));
        return n;
      });
    });
    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [links]);

  const onMouseDown = (e: React.MouseEvent, id?: string) => {
    if (id) {
      dragTargetId.current = id;
      setSelectedNodeId(id);
      setNodes(prev => prev.map(n => n.id === id ? { ...n, isFixed: true, vx: 0, vy: 0 } : n));
    } else {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragTargetId.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - viewOffset.x) / zoom;
      const y = (e.clientY - rect.top - viewOffset.y) / zoom;
      setNodes(prev => prev.map(n => n.id === dragTargetId.current ? { ...n, x, y } : n));
    } else if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setViewOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onMouseUp = () => {
    if (dragTargetId.current) {
      const id = dragTargetId.current;
      setNodes(prev => prev.map(n => {
        if (n.id === id) {
          const snappedX = Math.round(n.x / GRID_SIZE) * GRID_SIZE;
          const snappedY = Math.round(n.y / GRID_SIZE) * GRID_SIZE;
          return { ...n, x: snappedX, y: snappedY, isFixed: false, isStatic: n.type === 'creator', vx: 0, vy: 0 };
        }
        return n;
      }));
      dragTargetId.current = null;
    }
    setIsPanning(false);
  };

  const processedNodes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return nodes.map(n => ({ ...n, isMatch: true }));
    const matches = nodes.map(n => ({ ...n, isMatch: n.label.toLowerCase().includes(q) }));
    const creatorMatch = matches.find(n => n.type === 'creator' && n.isMatch);
    if (creatorMatch) {
      return matches.map(n => n.creatorId === creatorMatch.id ? { ...n, isMatch: true } : n);
    }
    return matches;
  }, [nodes, searchQuery]);

  const detailedData = useMemo(() => media.find(m => m.id === selectedNodeId), [media, selectedNodeId]);

  return (
    <div className="bg-[#050505] border border-[#1A1A1A] rounded-[40px] p-8 flex flex-col h-[900px] font-mono text-white relative overflow-hidden select-none shadow-2xl">
      
      {/* HUD HEADER */}
      <div className="flex justify-between items-center mb-6 z-30 relative gap-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-[#222] flex items-center justify-center rounded-xl bg-black">
            <Cpu size={18} className="text-sky-500" />
          </div>
          <div className="hidden md:block">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] italic">Neural Map v2.0</h2>
            <p className="text-[7px] font-bold text-sky-500/60 uppercase tracking-[0.3em] mt-1.5">Nodes: {nodes.length} // Zoom: {Math.round(zoom * 100)}%</p>
          </div>
        </div>

        <div className="flex-1 max-w-md relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" />
          <input 
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH_600_RECORDS..."
            className="w-full bg-black/40 border border-[#1A1A1A] rounded-2xl py-3 pl-12 text-[10px] font-black tracking-widest uppercase focus:border-sky-500/50 outline-none"
          />
        </div>

        <div className="flex bg-black/80 border border-[#1A1A1A] rounded-2xl p-1.5 gap-2">
          <button onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))} className="p-2 text-[#444] hover:text-sky-500"><ZoomIn size={14}/></button>
          <button onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.1))} className="p-2 text-[#444] hover:text-sky-500"><ZoomOut size={14}/></button>
          <button onClick={() => { setZoom(0.3); setViewOffset({x:0, y:0}); }} className="p-2 text-[#444] hover:text-sky-500 border-l border-[#222] ml-1"><Maximize2 size={14} /></button>
        </div>
      </div>

      <div 
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={(e) => onMouseDown(e)}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className={`relative flex-1 bg-[#010101] rounded-[32px] border border-[#111] overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <svg width="100%" height="100%" className="absolute inset-0">
          <g style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})`, transformOrigin: '0 0' }} className="transition-transform duration-75 ease-out">
            <defs>
              <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#fff" strokeOpacity="0.03" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width={WIDTH} height={HEIGHT} fill="url(#grid)" />

            {links.map((link, i) => {
              const s = nodes.find(n => n.id === link.sourceId);
              const t = nodes.find(n => n.id === link.targetId);
              if (!s || !t) return null;
              const isMatch = (searchQuery && (s.isMatch || t.isMatch)) || (!searchQuery && (selectedNodeId === s.id || selectedNodeId === t.id));
              return (
                <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} 
                  stroke={isMatch ? "#0EA5E9" : "#1A1A1A"} 
                  strokeOpacity={isMatch ? 0.6 : 0.1} strokeWidth={isMatch ? 3 : 1} />
              );
            })}

            {processedNodes.map(node => {
              const highlight = selectedNodeId === node.id || (searchQuery && node.isMatch);
              const opacity = node.isMatch ? 1 : 0.05;
              const r = node.type === 'creator' ? 60 : 35;

              return (
                <g key={node.id} onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, node.id); }} style={{ opacity }} className="transition-opacity duration-500">
                  {node.type === 'creator' ? (
                    <g>
                      <circle r={r} cx={node.x} cy={node.y} fill="#000" stroke={highlight ? "#0EA5E9" : "#333"} strokeWidth="2" />
                      <text x={node.x} y={node.y + 5} textAnchor="middle" fill={highlight ? "#fff" : "#666"} className="text-[12px] font-black uppercase italic tracking-tighter">{node.label}</text>
                    </g>
                  ) : (
                    <g>
                      <defs><clipPath id={`c-${node.id}`}><circle r={r-2} cx={node.x} cy={node.y} /></clipPath></defs>
                      <circle r={r+3} cx={node.x} cy={node.y} fill="#111" stroke={highlight ? "#0EA5E9" : "transparent"} strokeWidth="4" />
                      <image href={node.poster} x={node.x-r} y={node.y-r} height={r*2} width={r*2} clipPath={`url(#c-${node.id})`} preserveAspectRatio="xMidYMid slice" />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* SIDEBAR */}
        <div className={`absolute top-0 right-0 h-full w-80 bg-black/90 border-l border-white/5 backdrop-blur-xl z-50 transition-transform duration-500 ${detailedData ? 'translate-x-0' : 'translate-x-full'}`}>
          {detailedData && (
            <div className="p-8 flex flex-col h-full overflow-y-auto">
              <button onClick={() => setSelectedNodeId(null)} className="ml-auto text-white/20 hover:text-white"><X size={20}/></button>
              <h3 className="text-xl font-black text-white uppercase mt-4 leading-tight">{detailedData.title}</h3>
              <img src={detailedData.poster} className="w-full rounded-xl my-6 border border-white/10" alt="" />
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 p-3 rounded-lg text-center"><p className="text-sky-500 text-lg font-black">{detailedData.rating}.0</p></div>
                <div className="bg-white/5 p-3 rounded-lg text-center"><p className="text-[9px] uppercase font-bold">{detailedData.type}</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}