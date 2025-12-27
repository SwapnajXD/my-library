"use client";

import { useState, useEffect, useMemo } from "react";
import { useMediaStore } from "@/store/mediaStore";
import { VaultCard, VaultDetailsModal, VaultEditModal } from "@/components/vault";
import AddSearch from "@/components/search/AddSearch"; 
import { Plus, LayoutGrid, X as CloseIcon } from "lucide-react";
import { Media } from "@/types";

export default function Page() {
  const { media, deleteMedia, addMedia } = useMediaStore();
  
  const [selectedItem, setSelectedItem] = useState<Media | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  // Filter logic for the local library
  const filteredMedia = useMemo(() => {
    if (!activeGenre) return media;
    return media.filter(item => item.genres?.includes(activeGenre));
  }, [media, activeGenre]);

  // Global ESC key listener for modal stacking
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
    <main className="min-h-screen bg-black text-white p-4 md:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex justify-between items-center border-b border-neutral-900 pb-8">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-neutral-900 rounded-2xl text-sky-500">
                   <LayoutGrid size={24} />
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">VAULt</h1>
             </div>

             {/* Filter Status Badge */}
             {activeGenre && (
               <button 
                 onClick={() => setActiveGenre(null)}
                 className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-500 hover:bg-sky-500 hover:text-white transition-all group animate-in fade-in slide-in-from-left-4"
               >
                 <span className="text-[10px] font-black uppercase tracking-widest">{activeGenre}</span>
                 <CloseIcon size={12} strokeWidth={3} />
               </button>
             )}
          </div>

          <button 
            onClick={() => setIsSearching(true)}
            className="flex items-center gap-2 bg-white text-black h-11 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Add Entry
          </button>
        </header>

        {/* Media Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMedia.length > 0 ? (
            filteredMedia.map((item) => (
              <VaultCard 
                key={item.id} 
                item={item} 
                onView={setSelectedItem} 
                onDelete={deleteMedia} 
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-neutral-600 font-black uppercase tracking-[0.3em] text-[10px]">
                {activeGenre ? `No entries found for ${activeGenre}` : "The Vault is Empty"}
              </p>
            </div>
          )}
        </section>

        {/* Overlay Modals */}
        {isSearching && (
          <AddSearch 
            isOpen={isSearching} 
            onClose={() => setIsSearching(false)} 
          />
        )}

        {selectedItem && (
          <VaultDetailsModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onEdit={() => setEditingId(selectedItem.id)}
            onGenreClick={(genre) => {
              setActiveGenre(genre);
              setSelectedItem(null);
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