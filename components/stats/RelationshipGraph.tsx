"use client";

import { useMediaStore } from "@/store/mediaStore";
import { useMemo, useState, useEffect, useRef } from "react";
import { Share2, Zap, Activity, Box, Move, Maximize2 } from "lucide-react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'creator' | 'media';
  poster?: string;
  creatorId?: string;
}

interface Link {
  source: string;
  target: string;
}

export function RelationshipGraph() {
  const { media } = useMediaStore();
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Simulation State
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  
  // UI Toggles
  const [showLinks, setShowLinks] = useState(true);
  const [isGrayscale, setIsGrayscale] = useState(true);
  const [zoom, setZoom] = useState(1);

  // Initialize Nodes with Physics Properties
  useEffect(() => {
    const newNodes: Node[] = [];
    const newLinks: Link[] = [];
    const creatorMap: Record<string, string[]> = {};

    media.forEach(item => {
      const cName = item.creator || "Unknown";
      if (!creatorMap[cName]) creatorMap[cName] = [];
      creatorMap[cName].push(item.id);
    });

    Object.entries(creatorMap).forEach(([creator, itemIds], idx) => {
      const cId = `creator-${creator}`;
      const cx = 200 + (idx * 300);
      const cy = 250;

      newNodes.push({ id: cId, label: creator, x: cx, y: cy, vx: 0, vy: 0, type: 'creator' });

      itemIds.forEach((id, iIdx) => {
        const item = media.find(m => m.id === id);
        newNodes.push({ 
          id, 
          label: item?.title || "", 
          x: cx + Math.random() * 50, 
          y: cy + Math.random() * 50, 
          vx: 0, vy: 0, 
          type: 'media', 
          poster: item?.poster,
          creatorId: cId
        });
        newLinks.push({ source: cId, target: id });
      });
    });

    setNodes(newNodes);
    setLinks(newLinks);
  }, [media]);

  // Physics Simulation Loop
  useEffect(() => {
    let frameId: number;
    
    const simulate = () => {
      setNodes(prevNodes => {
        return prevNodes.map(node => {
          if (node.id === draggedNode) return node;

          let nvx = node.vx * 0.9; // Friction
          let nvy = node.vy * 0.9;

          // Attraction to Creator Node
          if (node.type === 'media' && node.creatorId) {
            const creator = prevNodes.find(n => n.id === node.creatorId);
            if (creator) {
              const dx = creator.x - node.x;
              const dy = creator.y - node.y;
              nvx += dx * 0.01;
              nvy += dy * 0.01;
            }
          }

          // Repulsion from other nodes
          prevNodes.forEach(other => {
            if (node.id === other.id) return;
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 100) {
              nvx += (dx / dist) * 0.5;
              nvy += (dy / dist) * 0.5;
            }
          });

          return {
            ...node,
            x: node.x + nvx,
            y: node.y + nvy,
            vx: nvx,
            vy: nvy
          };
        });
      });
      frameId = requestAnimationFrame(simulate);
    };

    frameId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(frameId);
  }, [draggedNode]);

  // Drag Handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    setNodes(prev => prev.map(n => n.id === draggedNode ? { ...n, x, y, vx: 0, vy: 0 } : n));
  };

  if (media.length === 0) return null;

  return (
    <div className="bg-[#050505] border border-[#1A1A1A] rounded-[40px] p-8 overflow-hidden relative group/graph select-none">
      
      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 rounded-lg"><Activity size={16} className="text-sky-500" /></div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Neural Interaction Map</h2>
        </div>

        <div className="flex bg-black border border-[#1A1A1A] rounded-xl p-1 gap-1">
          <button onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))} className="p-2 text-[#444] hover:text-white transition-all"><Maximize2 size={14} /></button>
          <button 
            onClick={() => setIsGrayscale(!isGrayscale)}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 ${!isGrayscale ? 'text-sky-500 bg-sky-500/10' : 'text-[#333]'}`}
          >
            <Zap size={14} />
            <span className="text-[8px] font-black uppercase">Chroma</span>
          </button>
          <button 
            onClick={() => setShowLinks(!showLinks)}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 ${showLinks ? 'text-sky-500 bg-sky-500/10' : 'text-[#333]'}`}
          >
            <Move size={14} />
            <span className="text-[8px] font-black uppercase">Physics</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="relative w-full h-[500px] overflow-hidden cursor-grab active:cursor-grabbing">
        <svg 
          ref={svgRef}
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${1200 / zoom} ${500 / zoom}`}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDraggedNode(null)}
          onMouseLeave={() => setDraggedNode(null)}
          className="transition-transform duration-200"
        >
          {/* Render Physics Links */}
          {showLinks && links.map((link, idx) => {
            const s = nodes.find(n => n.id === link.source);
            const t = nodes.find(n => n.id === link.target);
            if (!s || !t) return null;
            const active = hoveredNode === s.id || hoveredNode === t.id;

            return (
              <line
                key={idx}
                x1={s.x} y1={s.y}
                x2={t.x} y2={t.y}
                stroke={active ? "#0EA5E9" : "#1A1A1A"}
                strokeWidth={active ? 2 : 1}
                className="transition-colors duration-300"
                strokeDasharray={active ? "none" : "2 4"}
              />
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => (
            <g 
              key={node.id} 
              onMouseDown={() => setDraggedNode(node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="group"
            >
              {node.type === 'creator' ? (
                <>
                  <circle r="40" cx={node.x} cy={node.y} fill="black" stroke={hoveredNode === node.id ? "#0EA5E9" : "#222"} strokeWidth="1" className="transition-all" />
                  <text 
                    x={node.x} y={node.y + 4} 
                    textAnchor="middle" 
                    fill="white" 
                    className="text-[8px] font-black uppercase italic tracking-tighter pointer-events-none"
                  >
                    {node.label.length > 12 ? node.label.substring(0, 10) + '..' : node.label}
                  </text>
                </>
              ) : (
                <>
                  <defs>
                    <clipPath id={`clip-${node.id}`}>
                      <circle r="22" cx={node.x} cy={node.y} />
                    </clipPath>
                  </defs>
                  <circle 
                    r="25" cx={node.x} cy={node.y} 
                    fill="black" 
                    stroke={hoveredNode === node.id ? "#0EA5E9" : "#1A1A1A"} 
                    strokeWidth="2"
                    className="transition-all shadow-2xl"
                  />
                  <image
                    href={node.poster}
                    x={node.x - 22} y={node.y - 22}
                    height="44" width="44"
                    clipPath={`url(#clip-${node.id})`}
                    className={`transition-all duration-500 
                      ${isGrayscale ? 'grayscale group-hover:grayscale-0' : 'grayscale-0'} 
                      ${hoveredNode && hoveredNode !== node.id && hoveredNode !== node.creatorId ? 'opacity-20' : 'opacity-100'}`}
                  />
                </>
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-6 flex justify-between items-center opacity-20 group-hover/graph:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping" />
          <p className="text-[7px] font-black text-white uppercase tracking-[0.4em]">Kinetic Engine Active // Drag nodes to rearrange</p>
        </div>
        <p className="text-[7px] font-black text-[#444] uppercase tracking-widest italic">Simulation Ver 3.0.1</p>
      </div>
    </div>
  );
}