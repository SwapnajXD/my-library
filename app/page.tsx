"use client";

import { useState, useMemo, useRef } from "react";
import { useMediaStore, type MediaItem } from "@/store/mediaStore";
import { VaultCard, VaultDetailsModal, VaultEditModal } from "@/components/vault";
import { AnalyticsDashboard } from "@/components/stats";
import { AddSearch } from "@/components/search/AddSearch"; 
import { ModalBase, Button } from '@/components/ui';
import { 
  Plus, Zap, Download, Upload, Settings, ShieldCheck, 
  BarChart3, ChevronLeft, Activity, Link as LinkIcon, Network
} from "lucide-react";

export default function Page() {
  const { media, deleteMedia, setMedia, updateMedia } = useMediaStore();
  
  const [view, setView] = useState<'grid' | 'stats'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [proposals, setProposals] = useState<Array<{ sourceId: string; targetId: string; sourceTitle: string; targetTitle: string; sourceItem?: any; targetItem?: any }>>([]);
  const [selectedProposalIdx, setSelectedProposalIdx] = useState<Record<number, boolean>>({});
  const [showProposals, setShowProposals] = useState(false);
  const [expandedProposal, setExpandedProposal] = useState<Record<number, boolean>>({});

  // --- AUTO-CONNECT LOGIC (Merged & Fixed) ---
  // Compute proposed sequel links (non-destructive preview)
  const computeSequelProposals = () => {
    const items = [...media];
    const proposalsLocal: Array<{ sourceId: string; targetId: string; sourceTitle: string; targetTitle: string; sourceItem?: any; targetItem?: any }> = [];

    items.forEach(item => {
      if (!item.title) return;
      const cleanTitle = String(item.title)
        .split(/[:\(\-]/)[0]
        .replace(/(\sSeason\s\d+|\sPart\s\d+|\sII|III|IV|V|2|3|4|5)$/i, "")
        .trim()
        .toLowerCase();
      if (!cleanTitle) return;

      const sequel = items.find(m => {
        if (!m.title) return false;
        const mTitle = String(m.title).toLowerCase();
        const itemTitle = String(item.title).toLowerCase();
        return (
          m.id !== item.id &&
          mTitle.includes(cleanTitle) &&
          mTitle !== itemTitle &&
          !item.sequelId
        );
      });

      if (sequel) {
        proposalsLocal.push({ sourceId: item.id, targetId: sequel.id, sourceTitle: item.title || 'Unknown', targetTitle: sequel.title || 'Unknown', sourceItem: item, targetItem: sequel });
      }
    });

    // remove duplicates (keep first)
    const seen = new Set<string>();
    const deduped = proposalsLocal.filter(p => {
      const key = `${p.sourceId}->${p.targetId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return deduped;
  };

  const previewAutoConnect = () => {
    const p = computeSequelProposals();
    if (p.length === 0) {
      alert('No proposed connections detected.');
      return;
    }
    const selIdx: Record<number, boolean> = {};
    const exp: Record<number, boolean> = {};
    p.forEach((_, i) => { selIdx[i] = true; exp[i] = false; });
    setProposals(p);
    setSelectedProposalIdx(selIdx);
    setExpandedProposal(exp);
    setShowProposals(true);
  };

  const applySelectedProposals = () => {
    const toApply = proposals.filter((_, i) => selectedProposalIdx[i]);
    toApply.forEach(p => {
      updateMedia(p.sourceId, { sequelId: p.targetId });
    });
    setShowProposals(false);
    alert(`APPLIED: ${toApply.length} connections applied.`);
  };

  // --- DATA MANAGEMENT ---
  const exportVault = () => {
    const dataStr = JSON.stringify(media, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `vault-backup-${new Date().toISOString().split('T')[0]}.json`);
    link.click();
  };

  const importVault = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (!files || files.length === 0) return;
    fileReader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          const currentIds = new Set(media.map(m => m.id));
          const newEntries = importedData.filter(m => !currentIds.has(m.id));
          setMedia([...media, ...newEntries]);
        }
      } catch (err) { alert("Protocol Error: Invalid JSON File"); }
    };
    fileReader.readAsText(files[0]);
  };

  const filteredMedia = useMemo(() => {
    if (!activeGenre) return media;
    return media.filter(item => item.genres?.includes(activeGenre));
  }, [media, activeGenre]);

  const nextUp = useMemo(() => {
    return media.filter(item => {
      const isActive = item.status === 'watching' || item.status === 'reading';
      const isIncomplete = item.progress < (item.total || 999);
      return isActive && isIncomplete;
    }).slice(0, 6);
  }, [media]);

  return (
    <main className="min-h-screen bg-[#000000] text-[#E5E5E5] p-4 md:p-12 font-mono selection:bg-sky-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Block */}
        <header className="flex justify-between items-center border-b border-[#1A1A1A] pb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#050505] border border-[#1A1A1A] rounded-2xl text-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
                <Activity size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
                  VAULT
                </h1>
                {activeGenre && (
                  <button onClick={() => setActiveGenre(null)} className="text-[8px] font-black uppercase tracking-[0.4em] text-sky-500 mt-1 flex items-center gap-1">
                    [ Filter: {activeGenre} ] ×
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setShowSettings(!showSettings); if (view === 'stats') setView('grid'); }}
              className={`p-3 rounded-2xl border transition-all ${showSettings ? 'bg-white text-black border-white' : 'bg-[#050505] border-[#1A1A1A] text-[#444] hover:text-white'}`}
            >
              <Settings size={20} />
            </button>
            <button onClick={() => setIsSearching(true)} className="flex items-center gap-2 bg-white text-black h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-sky-500 hover:text-white transition-all active:scale-95">
              <Plus size={16} strokeWidth={4} /> Add Entry
            </button>
          </div>
        </header>

        {/* System Protocol Panel */}
        {showSettings && (
          <section className="bg-[#050505] border border-[#1A1A1A] rounded-[40px] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-8 border-b border-[#1A1A1A] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                {view === 'stats' && (
                  <button onClick={() => setView('grid')} className="p-2 bg-black border border-[#1A1A1A] rounded-xl text-white hover:border-sky-500">
                    <ChevronLeft size={16} />
                  </button>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={14} className="text-sky-500" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Neural Dashboard</p>
                  </div>
                  <p className="text-xs text-[#444] italic font-medium">Manage archive integrity, metadata mapping & relationships.</p>
                </div>
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                {view === 'grid' && (
                  <button onClick={() => setView('stats')} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-sky-500 hover:bg-sky-500 hover:text-white transition-all">
                    <BarChart3 size={16} /> Data Analytics
                  </button>
                )}
                <button onClick={exportVault} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-black border border-[#1A1A1A] rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:border-white transition-all">
                  <Download size={16} /> Backup
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-black border border-[#1A1A1A] rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:border-white transition-all">
                  <Upload size={16} /> Restore
                </button>
                <input type="file" ref={fileInputRef} onChange={importVault} accept=".json" className="hidden" />
              </div>
            </div>

            {view === 'stats' && (
              <AnalyticsDashboard items={media} />
            )}
          </section>
        )}

        {/* Core Interface */}
        {view === 'grid' && (
          <div className="space-y-16">
            {nextUp.length > 0 && (
              <section className="animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="flex items-center gap-3 mb-6 px-2">
                  <Zap size={14} className="text-sky-500" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#333]">Active Sequences</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {nextUp.map((item, idx) => (
                    <button 
                      key={`${item.id}-${idx}`} 
                      onClick={() => setEditingId(item.id)}
                      className="flex items-center gap-4 bg-[#050505] border border-[#1A1A1A] p-3 rounded-2xl shrink-0 hover:border-sky-500/50 transition-all group active:scale-95"
                    >
                      <img src={item.poster} alt="" className="w-10 h-10 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" />
                      <div className="text-left pr-4">
                        <p className="text-[9px] font-black text-white uppercase tracking-tight line-clamp-1 max-w-30">{item.title}</p>
                        <p className="text-[8px] font-bold text-[#444] uppercase tracking-widest mt-1">
                          EP <span className="text-sky-500">{item.progress}</span> / {item.total || '∞'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
              {filteredMedia.length > 0 ? (
                filteredMedia.map((item, idx) => (
                  <VaultCard key={`${item.id}-${idx}`} item={item} onView={setSelectedItem} onDelete={deleteMedia} />
                ))
              ) : (
                <div className="col-span-full py-40 text-center border border-dashed border-[#1A1A1A] rounded-[40px]">
                  <p className="text-[#1A1A1A] font-black uppercase tracking-[0.6em] text-[11px] italic">VAULT OFFLINE // NO DATA FOUND</p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Modals */}
        {isSearching && <AddSearch onClose={() => setIsSearching(false)} />}
        {selectedItem && (
          <VaultDetailsModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onEdit={() => { setEditingId(selectedItem.id); setSelectedItem(null); }}
            onGenreClick={(genre) => { setActiveGenre(genre); setSelectedItem(null); setShowSettings(false); }}
          />
        )}
        {editingId && <VaultEditModal itemId={editingId} onClose={() => setEditingId(null)} />}

        {showProposals && (
          <ModalBase title={`Proposed Connections (${proposals.length})`} onClose={() => setShowProposals(false)}>
            <div className="space-y-4 max-h-[60vh] overflow-auto">
              {proposals.map((p, i) => (
                <div key={`${p.sourceId}->${p.targetId}`} className="p-3 rounded-lg border border-neutral-900">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={!!selectedProposalIdx[i]}
                      onChange={() => setSelectedProposalIdx(prev => ({ ...prev, [i]: !prev[i] }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-black">{p.sourceTitle} → {p.targetTitle}</div>
                          <div className="text-xs text-neutral-500">{p.sourceId} → {p.targetId}</div>
                        </div>
                        <div className="text-xs text-neutral-400">Proposed</div>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-3 text-[13px]">
                        <div className="text-neutral-400">Sequel (before)</div>
                        <div className="font-mono">{p.sourceItem?.sequelId ?? '—'}</div>

                        <div className="text-neutral-400">Sequel (after)</div>
                        <div className="font-mono text-emerald-400">{p.targetId}</div>
                      </div>

                      <div className="mt-2 flex items-center gap-3">
                        <button className="text-xs text-neutral-400" onClick={() => setExpandedProposal(prev => ({ ...prev, [i]: !prev[i] }))}>
                          {expandedProposal[i] ? 'Hide details' : 'Show details'}
                        </button>
                        <span className="text-xs text-neutral-600">•</span>
                        <span className="text-xs text-neutral-500">Source: {p.sourceItem?.title ?? '—'}</span>
                      </div>

                      {expandedProposal[i] && (
                        <pre className="mt-3 p-3 bg-[#020202] rounded text-[11px] overflow-auto max-h-40">{JSON.stringify({ before: p.sourceItem, after: { ...p.sourceItem, sequelId: p.targetId } }, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowProposals(false)}>Cancel</Button>
              <Button variant="secondary" onClick={() => {
                // apply all
                proposals.forEach(p => updateMedia(p.sourceId, { sequelId: p.targetId }));
                setShowProposals(false);
                alert(`APPLIED: ${proposals.length} connections applied.`);
              }}>Apply All</Button>
              <Button variant="primary" onClick={applySelectedProposals}>Apply Selected</Button>
            </div>
          </ModalBase>
        )}
      </div>
    </main>
  );
}