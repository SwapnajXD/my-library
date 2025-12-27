"use client";

import { useMediaStore } from "@/store/mediaStore";
import { useState, useEffect, useRef, useCallback } from "react";
import { Activity, Maximize2, ZoomIn, ZoomOut } from "lucide-react";

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

export function RelationshipGraph({ searchQuery, selectedNodeId, setSelectedNodeId }: any) {
  const { media } = useMediaStore();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  
  const [zoom, setZoom] = useState(0.6); // Slightly zoomed out to accommodate longer edges
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const dragTargetId = useRef<string | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const timeRef = useRef(0);

  // --- EXTENDED EDGE PHYSICS CONSTANTS ---
  const FRICTION_MOVING = 0.88;   
  const FRICTION_STATIC = 0.72;   
  const ATTRACTION = 0.004;       // Lowered to let nodes drift further out
  const TARGET_EDGE_LENGTH = 320; // NEW: The ideal distance from Parent to Child
  const REPULSION_DIST = 250;     // Increased to give children more personal space
  const REPULSION_STRENGTH = 0.6; // Pushes harder to maintain the gap
  const GRID_SIZE = 700;          // Spaced creators further apart to avoid overlap
  const JITTER_SPEED = 0.04;      
  const JITTER_STRENGTH = 0.12;   

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
      // Creators start much further apart
      const cx = 800 + (idx * GRID_SIZE); 
      const cy = 800;

      initNodes.push({ id: cId, label: name, type: 'creator', x: cx, y: cy, vx: 0, vy: 0 });
      items.forEach((item, iIdx) => {
        const angle = (iIdx / items.length) * Math.PI * 2;
        // Start children at the new extended edge length
        initNodes.push({ 
          id: item.id, label: item.title, type: 'media', poster: item.poster, 
          creatorId: cId, 
          x: cx + Math.cos(angle) * TARGET_EDGE_LENGTH, 
          y: cy + Math.sin(angle) * TARGET_EDGE_LENGTH,
          vx: 0, vy: 0
        });
        initLinks.push({ source: cId, target: item.id });
      });
    });
    setNodes(initNodes);
    setLinks(initLinks);
  }, [media]);

  useEffect(() => { initializeGraph(); }, [initializeGraph]);

  useEffect(() => {
    if (!searchQuery || nodes.length === 0) return;
    const match = nodes.find(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()));
    if (match && containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setViewOffset({
        x: (width / 2) - (match.x * zoom),
        y: (height / 2) - (match.y * zoom)
      });
      setSelectedNodeId(match.id);
    }
  }, [searchQuery, zoom]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(Math.max(prev * delta, 0.05), 3));
    };
    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container?.removeEventListener('wheel', handleWheel);
  }, []);

  const updateLoop = useCallback(() => {
    timeRef.current += JITTER_SPEED;

    setNodes(prevNodes => {
      const next = prevNodes.map(n => ({ ...n }));
      for (let i = 0; i < next.length; i++) {
        const node = next[i];
        if (node.id === dragTargetId.current) continue;

        let nvx = node.vx * (dragTargetId.current ? FRICTION_MOVING : FRICTION_STATIC);
        let nvy = node.vy * (dragTargetId.current ? FRICTION_MOVING : FRICTION_STATIC);

        nvx += Math.cos(timeRef.current + i) * JITTER_STRENGTH;
        nvy += Math.sin(timeRef.current * 0.8 + i) * JITTER_STRENGTH;

        if (node.type === 'creator') {
          const targetX = Math.round(node.x / GRID_SIZE) * GRID_SIZE;
          const targetY = Math.round(node.y / GRID_SIZE) * GRID_SIZE;
          nvx += (targetX - node.x) * 0.05; 
          nvy += (targetY - node.y) * 0.05;
        }

        if (node.type === 'media' && node.creatorId) {
          const creator = next.find(n => n.id === node.creatorId);
          if (creator) {
            const dx = creator.x - node.x;
            const dy = creator.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Only pull if further than target length, or push if too close
            const diff = dist - TARGET_EDGE_LENGTH;
            nvx += (dx / dist) * diff * ATTRACTION;
            nvy += (dy / dist) * diff * ATTRACTION;
          }
        }

        if (node.type === 'media') {
          for (let j = 0; j < next.length; j++) {
            const other = next[j];
            if (node.id === other.id || other.type !== 'media') continue;
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < REPULSION_DIST * REPULSION_DIST && distSq > 1) {
              const dist = Math.sqrt(distSq);
              const force = (REPULSION_DIST - dist) / REPULSION_DIST;
              nvx += (dx / dist) * force * REPULSION_STRENGTH;
              nvy += (dy / dist) * force * REPULSION_STRENGTH;
            }
          }
        }

        node.vx = nvx; node.vy = nvy;
        node.x += nvx; node.y += nvy;
      }
      return next;
    });
    requestRef.current = requestAnimationFrame(updateLoop);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateLoop);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [updateLoop]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = (e.clientX - lastMousePos.current.x) / zoom;
    const dy = (e.clientY - lastMousePos.current.y) / zoom;
    if (dragTargetId.current) {
      const tid = dragTargetId.current;
      setNodes(prev => prev.map(n => n.id === tid ? { ...n, x: n.x + dx, y: n.y + dy, vx: 0, vy: 0 } : n));
    } else if (isPanning) {
      setViewOffset(prev => ({ x: prev.x + dx * zoom, y: prev.y + dy * zoom }));
    }
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const getIsHighlighted = (node: Node) => {
    if (!selectedNodeId) return true;
    if (node.id === selectedNodeId) return true;
    if (node.type === 'media' && node.creatorId === selectedNodeId) return true;
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    if (selectedNode?.type === 'media' && node.id === selectedNode.creatorId) return true;
    return false;
  };

  return (
    <div ref={containerRef} className="bg-[#050505] border border-white/5 rounded-[40px] p-8 overflow-hidden relative select-none h-full min-h-[700px]">
      
      <div className="flex justify-between items-center mb-8 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 rounded-lg"><Activity size={16} className="text-sky-500" /></div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Active Projection Map</h2>
        </div>
        <div className="flex bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-1 gap-1">
          <button onClick={() => setZoom(z => Math.min(z * 1.2, 3))} className="p-2 text-white/40 hover:text-white"><ZoomIn size={14}/></button>
          <button onClick={() => setZoom(z => Math.max(z * 0.8, 0.05))} className="p-2 text-white/40 hover:text-white"><ZoomOut size={14}/></button>
          <button onClick={() => {setZoom(0.6); setViewOffset({x:0,y:0}); setSelectedNodeId(null)}} className="p-2 text-white/40 hover:text-sky-400"><Maximize2 size={14}/></button>
        </div>
      </div>

      <div className="relative w-full h-full min-h-[500px] cursor-grab active:cursor-grabbing">
        <svg 
          ref={svgRef}
          width="100%" height="100%" 
          onMouseMove={handleMouseMove}
          onMouseDown={(e) => { lastMousePos.current = { x: e.clientX, y: e.clientY }; setIsPanning(true); }}
          onMouseUp={() => { dragTargetId.current = null; setIsPanning(false); }}
          onMouseLeave={() => { dragTargetId.current = null; setIsPanning(false); }}
          onClick={(e) => { if (e.target === svgRef.current) setSelectedNodeId(null); }}
        >
          <defs>
            {nodes.map(node => node.poster && (
              <pattern key={`pattern-${node.id}`} id={`img-${node.id}`} patternUnits="objectBoundingBox" width="1" height="1">
                <image href={node.poster} width="72" height="72" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            ))}
          </defs>

          <g style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
            {links.map((link, idx) => {
              const s = nodes.find(n => n.id === link.source);
              const t = nodes.find(n => n.id === link.target);
              if (!s || !t) return null;
              
              const isSearching = !!searchQuery;
              const isMatch = isSearching && (s.label.toLowerCase().includes(searchQuery.toLowerCase()) || t.label.toLowerCase().includes(searchQuery.toLowerCase()));
              const isChildOfSelectedCreator = selectedNodeId === s.id || selectedNodeId === t.id;
              const isActive = isMatch || isChildOfSelectedCreator;

              return (
                <line 
                  key={idx} 
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y} 
                  stroke={isActive ? "#0EA5E9" : "#FFFFFF"} 
                  strokeOpacity={isActive ? 0.9 : selectedNodeId ? 0.05 : 0.1} 
                  strokeWidth={isActive ? 3 : 1} 
                />
              );
            })}

            {nodes.map((node) => {
              const isMatch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
              const isHighlighted = getIsHighlighted(node) || isMatch;

              return (
                <g 
                  key={node.id} 
                  onMouseDown={(e) => { e.stopPropagation(); dragTargetId.current = node.id; setSelectedNodeId(node.id); }} 
                  style={{ opacity: isHighlighted ? 1 : 0.1, transition: 'opacity 0.4s' }}
                >
                  {node.type === 'creator' ? (
                    <>
                      <circle r="56" cx={node.x} cy={node.y} fill="#000" stroke={selectedNodeId === node.id || isMatch ? "#0EA5E9" : "#ffffff20"} strokeWidth="2.5" />
                      <text x={node.x} y={node.y + 4} textAnchor="middle" fill="white" className="text-[11px] font-black uppercase tracking-tighter pointer-events-none italic">
                        {node.label}
                      </text>
                    </>
                  ) : (
                    <>
                      <circle r="38" cx={node.x} cy={node.y} fill="black" stroke={selectedNodeId === node.id || isMatch ? "#0EA5E9" : "#ffffff10"} strokeWidth="2" />
                      <circle r="36" cx={node.x} cy={node.y} fill={`url(#img-${node.id})`} />
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