"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useMediaStore } from "@/store/mediaStore";
import { VaultCard, VaultDetailsModal, VaultEditModal } from "@/components/vault";
import AddSearch from "@/components/search/AddSearch"; 
import { Plus, X as CloseIcon, Zap, Download, Upload, Settings, ShieldCheck } from "lucide-react";
import { Media } from "@/types";

export default function Page() {
  const { media, deleteMedia, setMedia } = useMediaStore();
  
  const [selectedItem, setSelectedItem] = useState<Media | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter media by genre if one is selected
  const filteredMedia = useMemo(() => {
    if (!activeGenre) return media;
    return media.filter(item => item.genres?.includes(activeGenre));
  }, [media, activeGenre]);

  // Items currently being watched/read with progress remaining
  const nextUp = useMemo(() => {
    return media.filter(item => 
      (item.status === 'watching' || item.status === 'reading') && 
      item.progress < (item.total || 999)
    ).slice(0, 6);
  }, [media]);

  const exportVault = () => {
    const dataStr = JSON.stringify(media, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importVault = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const importedData = JSON.parse(content);
          if (Array.isArray(importedData)) {
            if (confirm(`Import ${importedData.length} entries? Duplicate IDs will be skipped.`)) {
              const currentIds = new Set(media.map(m => m.id));
              const newEntries = importedData.filter(m => !currentIds.has(m.id));
              setMedia([...media, ...newEntries]);
            }
          }
        }
      } catch (err) {
        alert("Sync Failed: Invalid JSON File.");
      }
    };
    fileReader.readAsText(files[0]);
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingId) setEditingId(null);
        else if (selectedItem) setSelectedItem(null);
        else if (isSearching) setIsSearching(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [editingId, selectedItem, isSearching]);

  return (
    <main className="min-h-screen bg-[#000000] text-[#E5E5E5] p-4 md:p-12 selection:bg-sky-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-[#1A1A1A] pb-8">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-[#050505] border border-[#1A1A1A] rounded-2xl text-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                      <path d="M12 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" opacity="0.3" />
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                   </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white leading-none">VAULt</h1>
             </div>
             {activeGenre && (
               <button onClick={() => setActiveGenre(null)} className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-[#1A1A1A] rounded-full text-sky-400 hover:border-sky-500 transition-all">
                 <span className="text-[10px] font-black uppercase tracking-widest">{activeGenre}</span>
                 <CloseIcon size={12} strokeWidth={3} />
               </button>
             )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-2xl border transition-all ${showSettings ? 'bg-white text-black border-white' : 'bg-[#050505] border-[#1A1A1A] text-[#444444] hover:text-white'}`}
            >
              <Settings size={20} />
            </button>
            <button onClick={() => setIsSearching(true)} className="flex items-center gap-2 bg-white text-black h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-sky-500 hover:text-white transition-all shadow-2xl active:scale-95">
              <Plus size={16} strokeWidth={4} /> Add Entry
            </button>
          </div>
        </header>

        {/* Hidden Settings Panel */}
        {showSettings && (
          <section className="bg-[#050505] border border-[#1A1A1A] rounded-[32px] p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={14} className="text-sky-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">System Archive</p>
                </div>
                <p className="text-xs text-[#444444] font-medium italic">Manage local database backups and storage protocols.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button onClick={exportVault} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:border-sky-500 transition-all active:scale-95">
                  <Download size={16} /> Export JSON
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:border-sky-500 transition-all active:scale-95">
                  <Upload size={16} /> Import JSON
                </button>
                <input type="file" ref={fileInputRef} onChange={importVault} accept=".json" className="hidden" />
              </div>
            </div>
          </section>
        )}

        {/* Continuity Queue */}
        {nextUp.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-6 px-2">
              <Zap size={14} className="text-sky-500" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#333333]">Continuity Queue</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {nextUp.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => setEditingId(item.id)}
                  className="flex items-center gap-4 bg-[#050505] border border-[#1A1A1A] p-3 rounded-2xl shrink-0 hover:border-sky-500/50 transition-all group active:scale-95"
                >
                  <img src={item.poster} alt="" className="w-10 h-10 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" />
                  <div className="text-left pr-4">
                    <p className="text-[9px] font-black text-white uppercase tracking-tight line-clamp-1">{item.title}</p>
                    <p className="text-[8px] font-bold text-[#444444] uppercase tracking-widest mt-1">
                       Progress: <span className="text-sky-500">{item.progress}</span> / {item.total || '?'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Main Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMedia.length > 0 ? (
            filteredMedia.map((item) => (
              <VaultCard key={item.id} item={item} onView={setSelectedItem} onDelete={deleteMedia} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center border border-dashed border-[#1A1A1A] rounded-[40px]">
              <p className="text-[#1A1A1A] font-black uppercase tracking-[0.6em] text-[11px] italic">VAULT OFFLINE</p>
            </div>
          )}
        </section>

        {/* Modals */}
        {isSearching && <AddSearch isOpen={isSearching} onClose={() => setIsSearching(false)} />}
        {selectedItem && (
          <VaultDetailsModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onEdit={() => setEditingId(selectedItem.id)}
            onGenreClick={(genre: string) => { setActiveGenre(genre); setSelectedItem(null); }}
          />
        )}
        {editingId && <VaultEditModal itemId={editingId} onClose={() => setEditingId(null)} />}
      </div>
    </main>
  );
}