"use client";

import { useMediaStore } from "@/store/mediaStore";
import { useMemo, useState, useEffect, useRef } from "react";
import { 
  RefreshCw, Maximize2, Search, Database, 
  X, Cpu, Terminal 
} from "lucide-react";

interface Node {
  id: string;
  label: string;
  type: 'creator' | 'media';
  poster?: string;
  x: number;
  y: number;
  vx: number; // Velocity X
  vy: number; // Velocity Y
  isMatch?: boolean;
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
  const [zoom, setZoom] = useState(1);

  // Dragging state
  const dragTarget = useRef<string | null>(null);
  const requestRef = useRef<number>(null);

  const WIDTH = 1200;
  const HEIGHT = 700;
  const FRICTION = 0.92; // Adjust this to decrease velocity (0.98 = fast, 0.8 = slow)
  const REPULSION = 500; // How much nodes push each other

  // 1. Initialize Nodes and Links
  useEffect(() => {
    if (!media || media.length === 0) return;

    const initialNodes: Node[] = [];
    const initialLinks: Link[] = [];
    const creatorMap: Record<string, string[]> = {};

    media.forEach(item => {
      const cName = item.creator || "Unknown";
      if (!creatorMap[cName]) creatorMap[cName] = [];
      creatorMap[cName].push(item.id);
    });

    Object.entries(creatorMap).forEach(([creator, itemIds]) => {
      const cId = `creator-${creator}`;
      initialNodes.push({ 
        id: cId, label: creator, type: 'creator', 
        x: WIDTH / 2 + (Math.random() - 0.5) * 400, 
        y: HEIGHT / 2 + (Math.random() - 0.5) * 400,
        vx: 0, vy: 0 
      });

      itemIds.forEach(id => {
        const item = media.find(m => m.id === id);
        initialNodes.push({ 
          id, label: item?.title || "", type: 'media', poster: item?.poster,
          x: WIDTH / 2 + (Math.random() - 0.5) * 400, 
          y: HEIGHT / 2 + (Math.random() - 0.5) * 400,
          vx: 0, vy: 0 
        });
        initialLinks.push({ sourceId: cId, targetId: id });
      });
    });

    setNodes(initialNodes);
    setLinks(initialLinks);
  }, [media]);

  // 2. Physics Engine (Manual Force Directed Graph)
  const updatePhysics = () => {
    setNodes(prevNodes => {
      const newNodes = prevNodes.map(n => ({ ...n }));

      // Repulsion (Nodes push each other)
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const dx = newNodes[i].x - newNodes[j].x;
          const dy = newNodes[i].y - newNodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy) + 1;
          const force = REPULSION / (distance * distance);
          
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          newNodes[i].vx += fx;
          newNodes[i].vy += fy;
          newNodes[j].vx -= fx;
          newNodes[j].vy -= fy;
        }
      }

      // Attraction (Links pull nodes together)
      links.forEach(link => {
        const source = newNodes.find(n => n.id === link.sourceId);
        const target = newNodes.find(n => n.id === link.targetId);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const force = (distance - 100) * 0.01; // Spring constant

          source.vx += (dx / distance) * force;
          source.vy += (dy / distance) * force;
          target.vx -= (dx / distance) * force;
          target.vy -= (dy / distance) * force;
        }
      });

      // Update positions
      return newNodes.map(node => {
        if (node.id === dragTarget.current) return node; // Don't move if being dragged

        node.vx *= FRICTION; // Velocity decrease
        node.vy *= FRICTION;
        node.x += node.vx;
        node.y += node.vy;

        // Boundary checks
        if (node.x < 0) node.x = 0;
        if (node.x > WIDTH) node.x = WIDTH;
        if (node.y < 0) node.y = 0;
        if (node.y > HEIGHT) node.y = HEIGHT;

        return node;
      });
    });

    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [links]);

  // 3. Drag Handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragTarget.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setNodes(prev => prev.map(n => n.id === dragTarget.current ? { ...n, x, y, vx: 0, vy: 0 } : n));
  };

  const displayNodes = useMemo(() => {
    if (!searchQuery) return nodes;
    const q = searchQuery.toLowerCase();
    return nodes.map(n => ({ ...n, isMatch: n.label.toLowerCase().includes(q) }));
  }, [nodes, searchQuery]);

  const detailedData = useMemo(() => media.find(m => m.id === selectedNodeId), [media, selectedNodeId]);

  return (
    <div className="bg-[#050505] border border-[#1A1A1A] rounded-[40px] p-8 overflow-hidden relative select-none flex flex-col h-[850px] font-mono">
      
      {/* HUD */}
      <div className="flex justify-between items-start mb-8 z-30 relative">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-sky-500/20 flex items-center justify-center rounded-xl bg-sky-500/5 text-sky-500">
            <Database size={18} />
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white">React Native Physics</h2>
            <p className="text-[7px] text-sky-500/60 uppercase tracking-widest mt-1">VELOCITY_FRICTION: {FRICTION}</p>
          </div>
        </div>

        <div className="flex bg-black/50 border border-white/5 rounded-2xl p-1.5 gap-2 backdrop-blur-md">
          <input 
            type="text"
            placeholder="FILTER_GRAPH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none py-2 px-4 text-[10px] text-white w-48 focus:outline-none"
          />
          <button onClick={() => setZoom(1)} className="p-2 text-[#444] hover:text-sky-400 transition-colors"><RefreshCw size={14} /></button>
          <button onClick={() => setZoom(z => z + 0.1)} className="p-2 text-[#444] hover:text-sky-400 transition-colors"><Maximize2 size={14} /></button>
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={() => { dragTarget.current = null; }}
        onMouseLeave={() => { dragTarget.current = null; }}
        className="relative flex-1 bg-[#020202] rounded-[32px] border border-white/5 overflow-hidden cursor-crosshair"
      >
        <svg 
          width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          className="transition-transform duration-300"
        >
          {/* Links */}
          {links.map((link, i) => {
            const s = nodes.find(n => n.id === link.sourceId);
            const t = nodes.find(n => n.id === link.targetId);
            if (!s || !t) return null;
            return (
              <line 
                key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke="#1A1A1A" strokeWidth={1}
              />
            );
          })}

          {/* Nodes */}
          {displayNodes.map((node) => (
            <g 
              key={node.id} 
              onMouseDown={(e) => {
                e.stopPropagation();
                dragTarget.current = node.id;
                setSelectedNodeId(node.id);
              }}
              className="cursor-grab active:cursor-grabbing"
              style={{ opacity: searchQuery && !node.isMatch ? 0.1 : 1 }}
            >
              {node.type === 'creator' ? (
                <g>
                  <circle r="40" cx={node.x} cy={node.y} fill="#000" stroke="#333" />
                  <Cpu x={node.x - 10} y={node.y - 10} size={20} className="text-sky-500/30" />
                  <text x={node.x} y={node.y + 60} textAnchor="middle" fill="#444" className="text-[8px] uppercase tracking-widest">{node.label}</text>
                </g>
              ) : (
                <g>
                  <clipPath id={`clip-${node.id}`}><circle r="30" cx={node.x} cy={node.y} /></clipPath>
                  <circle r="33" cx={node.x} cy={node.y} fill="#111" stroke="#222" />
                  <image 
                    href={node.poster} x={node.x - 30} y={node.y - 30} 
                    height="60" width="60" clipPath={`url(#clip-${node.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* Sidebar */}
        <div className={`absolute inset-y-0 right-0 w-80 bg-black/80 backdrop-blur-xl border-l border-white/5 transition-transform duration-500 p-8 ${detailedData ? 'translate-x-0' : 'translate-x-full'}`}>
          {detailedData && (
            <div className="relative h-full flex flex-col">
              <button onClick={() => setSelectedNodeId(null)} className="absolute -top-2 -right-2 p-2 text-white/20 hover:text-white"><X size={20}/></button>
              <div className="flex items-center gap-2 mb-4">
                <Terminal size={12} className="text-sky-500" />
                <span className="text-[9px] text-sky-500 uppercase font-black">Data_Entry</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-tighter">{detailedData.title}</h3>
              <img src={detailedData.poster} className="w-full rounded-xl border border-white/10 mb-6" alt="" />
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <span className="text-[8px] text-white/30 uppercase block mb-1">Creator</span>
                <p className="text-xs text-white uppercase">{detailedData.creator}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}