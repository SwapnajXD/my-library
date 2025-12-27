"use client";

import { useState, useMemo, useRef } from "react";
import { useMediaStore } from "@/store/mediaStore";
import { VaultCard, VaultDetailsModal, VaultEditModal } from "@/components/vault";
import { StatsView } from "@/components/stats/StatsView";
import { AddSearch } from "@/components/search/AddSearch"; 
import { 
  Plus, 
  Zap, 
  Download, 
  Upload, 
  Settings, 
  ShieldCheck, 
  BarChart3, 
  ChevronLeft,
  Activity
} from "lucide-react";
import { MediaItem } from "@/store/mediaStore";

export default function Page() {
  const { media, deleteMedia, setMedia } = useMediaStore();
  
  const [view, setView] = useState<'grid' | 'stats'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered items for the grid
  const filteredMedia = useMemo(() => {
    if (!activeGenre) return media;
    return media.filter(item => item.genres?.includes(activeGenre));
  }, [media, activeGenre]);

  // Continuity Queue - Explicitly handling status comparison to avoid TS error
  const nextUp = useMemo(() => {
    return media.filter(item => {
      const status = item.status as string; // Casting to avoid union overlap error
      const isActive = status === 'watching' || status === 'reading';
      const isIncomplete = item.progress < (item.total || 999);
      return isActive && isIncomplete;
    }).slice(0, 6);
  }, [media]);

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

  return (
    <main className="min-h-screen bg-[#000000] text-[#E5E5E5] p-4 md:p-12 selection:bg-sky-500/30">
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
                  VAUL<span className="text-sky-500">T</span>
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
              onClick={() => {
                setShowSettings(!showSettings);
                if (view === 'stats') setView('grid');
              }}
              className={`p-3 rounded-2xl border transition-all ${showSettings ? 'bg-white text-black border-white' : 'bg-[#050505] border-[#1A1A1A] text-[#444] hover:text-white'}`}
            >
              <Settings size={20} />
            </button>
            <button onClick={() => setIsSearching(true)} className="flex items-center gap-2 bg-white text-black h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-sky-500 hover:text-white transition-all shadow-2xl active:scale-95">
              <Plus size={16} strokeWidth={4} /> Add Entry
            </button>
          </div>
        </header>

        {/* System Protocol Panel (Settings & Stats) */}
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
                  <p className="text-xs text-[#444] italic font-medium">Manage archive integrity and metadata mapping.</p>
                </div>
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                {view === 'grid' && (
                  <button 
                    onClick={() => setView('stats')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-sky-500 hover:bg-sky-500 hover:text-white transition-all"
                  >
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
              <div className="p-8 bg-black/50 overflow-y-auto max-h-[80vh] custom-scrollbar">
                <StatsView />
              </div>
            )}
          </section>
        )}

        {/* Core Interface */}
        {view === 'grid' && (
          <div className="space-y-16">
            {/* Continuity Queue */}
            {nextUp.length > 0 && (
              <section className="animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="flex items-center gap-3 mb-6 px-2">
                  <Zap size={14} className="text-sky-500" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#333]">Active Sequences</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {nextUp.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => setEditingId(item.id)}
                      className="flex items-center gap-4 bg-[#050505] border border-[#1A1A1A] p-3 rounded-2xl shrink-0 hover:border-sky-500/50 transition-all group active:scale-95"
                    >
                      <img src={item.poster} alt="" className="w-10 h-10 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" />
                      <div className="text-left pr-4">
                        <p className="text-[9px] font-black text-white uppercase tracking-tight line-clamp-1 max-w-[120px]">{item.title}</p>
                        <p className="text-[8px] font-bold text-[#444] uppercase tracking-widest mt-1">
                          EP <span className="text-sky-500">{item.progress}</span> / {item.total || '∞'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* The Main Archive Grid */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
              {filteredMedia.length > 0 ? (
                filteredMedia.map((item) => (
                  <VaultCard key={item.id} item={item} onView={setSelectedItem} onDelete={deleteMedia} />
                ))
              ) : (
                <div className="col-span-full py-40 text-center border border-dashed border-[#1A1A1A] rounded-[40px]">
                  <p className="text-[#1A1A1A] font-black uppercase tracking-[0.6em] text-[11px] italic">VAULT OFFLINE // NO DATA FOUND</p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Global Modals */}
        {isSearching && <AddSearch onClose={() => setIsSearching(false)} />}
        
        {selectedItem && (
          <VaultDetailsModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onEdit={() => {
              setEditingId(selectedItem.id);
              setSelectedItem(null);
            }}
            onGenreClick={(genre) => {
              setActiveGenre(genre);
              setSelectedItem(null);
              setShowSettings(false);
            }}
          />
        )}

        {editingId && (
          <VaultEditModal 
            itemId={editingId} 
            onClose={() => setEditingId(null)} 
          />
        )}
      </div>
    </main>
  );
}