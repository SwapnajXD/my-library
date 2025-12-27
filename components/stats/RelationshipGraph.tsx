"use client";

import { useMediaStore } from "@/store/mediaStore";
import { useState, useEffect, useRef, useCallback } from "react";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";

/**
 * RELATIONSHIP GRAPH - KINETIC GRID ENGINE
 * ---------------------------------------
 * Features:
 * - Physics: Force-directed velocity (vx, vy) with friction damping.
 * - Alignment: Creator nodes snap to 250px grid intersections.
 * - Interaction: Kinetic panning, relative-delta dragging, and smooth zoom.
 * - Search: Auto-panning and selective opacity filtering.
 */

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
}

interface Link {
  source: string;
  target: string;
}

interface GraphProps {
  searchQuery: string;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
}

export function RelationshipGraph({ searchQuery, selectedNodeId, setSelectedNodeId }: GraphProps) {
  const { media } = useMediaStore();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  
  const [zoom, setZoom] = useState(0.8); 
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const dragTargetId = useRef<string | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const timeRef = useRef(0);

  // --- GRID ALIGNED PHYSICS CONSTANTS ---
  const FRICTION = 0.82;         
  const ATTRACTION = 0.05;      
  const REPULSION = 0.8;        
  const TARGET_DIST = 110;      
  const GRID_STEP = 250;        
  const JITTER_SPEED = 0.03;    
  const JITTER_STRENGTH = 0.08; 

  const initializeGraph = useCallback(() => {
    if (!media.length) return;
    const initNodes: Node[] = [];
    const initLinks: Link[] = [];
    const creators: Record<string, any[]> = {};

    media.forEach(m => {
      const cName = m.creator || "Unknown";
      if (!creators[cName]) creators[cName] = [];
      creators[cName].push(m);
    });

    Object.entries(creators).forEach(([name, items], idx) => {
      const cId = `creator-${name.replace(/\s+/g, '-').toLowerCase()}`;
      const cols = Math.ceil(Math.sqrt(Object.keys(creators).length));
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      
      const cx = col * GRID_STEP; 
      const cy = row * GRID_STEP;

      initNodes.push({ id: cId, label: name, type: 'creator', x: cx, y: cy, vx: 0, vy: 0 });
      
      items.forEach((item, iIdx) => {
        const angle = (iIdx / items.length) * Math.PI * 2;
        initNodes.push({ 
          id: item.id, label: item.title, type: 'media', poster: item.poster, 
          creatorId: cId, 
          x: cx + Math.cos(angle) * TARGET_DIST, 
          y: cy + Math.sin(angle) * TARGET_DIST,
          vx: 0, vy: 0
        });
        initLinks.push({ source: cId, target: item.id });
      });
    });
    setNodes(initNodes);
    setLinks(initLinks);
  }, [media]);

  useEffect(() => { initializeGraph(); }, [initializeGraph]);

  const updateLoop = useCallback(() => {
    timeRef.current += JITTER_SPEED;

    setNodes(prevNodes => {
      if (prevNodes.length === 0) return prevNodes;
      const next = prevNodes.map(n => ({ ...n }));
      
      for (let i = 0; i < next.length; i++) {
        const node = next[i];
        if (node.id === dragTargetId.current) continue;

        let nvx = node.vx * FRICTION;
        let nvy = node.vy * FRICTION;

        nvx += Math.cos(timeRef.current + i) * JITTER_STRENGTH;
        nvy += Math.sin(timeRef.current * 0.8 + i) * JITTER_STRENGTH;

        if (node.type === 'creator') {
          const snapX = Math.round(node.x / GRID_STEP) * GRID_STEP;
          const snapY = Math.round(node.y / GRID_STEP) * GRID_STEP;
          nvx += (snapX - node.x) * 0.2; 
          nvy += (snapY - node.y) * 0.2;
        }

        if (node.type === 'media' && node.creatorId) {
          const creator = next.find(n => n.id === node.creatorId);
          if (creator) {
            const dx = creator.x - node.x;
            const dy = creator.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const pull = (dist - TARGET_DIST) * ATTRACTION;
            nvx += (dx / dist) * pull;
            nvy += (dy / dist) * pull;
          }
        }

        for (let j = 0; j < next.length; j++) {
          if (i === j) continue;
          const other = next[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 80 * 80 && distSq > 1) {
            const dist = Math.sqrt(distSq);
            nvx += (dx / dist) * REPULSION;
            nvy += (dy / dist) * REPULSION;
          }
        }

        node.vx = nvx; node.vy = nvy;
        node.x += nvx; node.y += nvy;
      }
      return next;
    });
    requestRef.current = requestAnimationFrame(updateLoop);
  }, [FRICTION, ATTRACTION, REPULSION, TARGET_DIST, GRID_STEP, JITTER_STRENGTH]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateLoop);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [updateLoop]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = (e.clientX - lastMousePos.current.x) / zoom;
    const dy = (e.clientY - lastMousePos.current.y) / zoom;
    if (dragTargetId.current) {
      setNodes(prev => prev.map(n => n.id === dragTargetId.current ? { ...n, x: n.x + dx, y: n.y + dy, vx: 0, vy: 0 } : n));
    } else if (isPanning) {
      setViewOffset(prev => ({ x: prev.x + dx * zoom, y: prev.y + dy * zoom }));
    }
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const getIsHighlighted = (node: Node) => {
    const isSearching = !!searchQuery;
    if (isSearching) return node.label.toLowerCase().includes(searchQuery.toLowerCase());
    if (!selectedNodeId) return true;
    if (node.id === selectedNodeId) return true;
    if (node.type === 'media' && node.creatorId === selectedNodeId) return true;
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    if (selectedNode?.type === 'media' && node.id === selectedNode.creatorId) return true;
    return false;
  };

  return (
    <div ref={containerRef} className="bg-[#050505] border border-white/5 rounded-[40px] overflow-hidden relative select-none h-full min-h-[700px]">
      
      {/* HUD CONTROLS */}
      <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-2">
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 3))} className="p-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white/50 hover:text-white transition-all"><ZoomIn size={20}/></button>
        <button onClick={() => setZoom(z => Math.max(z * 0.8, 0.05))} className="p-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white/50 hover:text-white transition-all"><ZoomOut size={20}/></button>
        <button onClick={() => {setZoom(0.8); setViewOffset({x:0,y:0}); setSelectedNodeId(null)}} className="p-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white/50 hover:text-sky-400 transition-all"><Maximize2 size={20}/></button>
      </div>

      <div className="relative w-full h-full min-h-[500px] cursor-grab active:cursor-grabbing">
        <svg ref={svgRef} width="100%" height="100%" onMouseMove={handleMouseMove}
          onMouseDown={(e) => { lastMousePos.current = { x: e.clientX, y: e.clientY }; setIsPanning(true); }}
          onMouseUp={() => { dragTargetId.current = null; setIsPanning(false); }}
          onMouseLeave={() => { dragTargetId.current = null; setIsPanning(false); }}
        >
          <defs>
            <pattern id="minorGrid" width={50} height={50} patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="0.5" />
            </pattern>
            <pattern id="grid" width={250} height={250} patternUnits="userSpaceOnUse">
              <rect width="250" height="250" fill="url(#minorGrid)" />
              <path d="M 250 0 L 0 0 0 250" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
            </pattern>
            {nodes.map(node => node.poster && (
              <pattern key={`pattern-${node.id}`} id={`img-${node.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                <image href={node.poster} width="70" height="70" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            ))}
          </defs>

          <rect width="1000%" height="1000%" x="-500%" y="-500%" fill="url(#grid)" 
            style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})`, transformOrigin: '0 0' }} 
          />

          <g style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
            {links.map((link, idx) => {
              const s = nodes.find(n => n.id === link.source);
              const t = nodes.find(n => n.id === link.target);
              if (!s || !t) return null;
              const isActive = (selectedNodeId === s.id || selectedNodeId === t.id) || (searchQuery && (s.label.toLowerCase().includes(searchQuery.toLowerCase()) || t.label.toLowerCase().includes(searchQuery.toLowerCase())));
              return <line key={idx} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={isActive ? "#0EA5E9" : "#FFFFFF"} strokeOpacity={isActive ? 0.8 : 0.1} strokeWidth={isActive ? 2 : 1} />;
            })}

            {nodes.map((node) => {
              const isHighlighted = getIsHighlighted(node);
              const isSearchMatch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
              return (
                <g key={node.id} onMouseDown={(e) => { e.stopPropagation(); dragTargetId.current = node.id; setSelectedNodeId(node.id); }} style={{ opacity: isHighlighted ? 1 : 0.1, transition: 'opacity 0.4s' }}>
                  {node.type === 'creator' ? (
                    <>
                      <circle r="4" cx={node.x} cy={node.y} fill="#0EA5E9" opacity="0.4" />
                      <circle r="45" cx={node.x} cy={node.y} fill="#000" stroke={isSearchMatch || selectedNodeId === node.id ? "#0EA5E9" : "#ffffff30"} strokeWidth="2" />
                      <text x={node.x} y={node.y + 4} textAnchor="middle" fill="white" className="text-[8px] font-black uppercase tracking-tighter italic pointer-events-none">{node.label}</text>
                    </>
                  ) : (
                    <>
                      <circle r="35" cx={node.x} cy={node.y} fill="black" stroke={isSearchMatch || selectedNodeId === node.id ? "#0EA5E9" : "#ffffff15"} strokeWidth="2" />
                      <circle r="33" cx={node.x} cy={node.y} fill={`url(#img-${node.id})`} />
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}