"use client";

import { useState, useEffect } from "react";
import { useMediaStore } from "@/store/mediaStore";
import { VaultCard, VaultDetailsModal, VaultEditModal } from "@/components/vault";
import AddSearch from "@/components/search/AddSearch"; 
import { Plus, LayoutGrid } from "lucide-react";
import { Media } from "@/types";

export default function Page() {
  const { media, deleteMedia, addMedia } = useMediaStore();
  
  const [selectedItem, setSelectedItem] = useState<Media | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Global ESC key listener for all modals
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

  const handleSearchResultSelect = (newItem: Media) => {
    addMedia(newItem);
    setIsSearching(false);
    setEditingId(newItem.id); 
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-neutral-900 pb-8">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-neutral-900 rounded-2xl text-sky-500">
                <LayoutGrid size={24} />
             </div>
             <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">VAULt</h1>
          </div>

          <button 
            onClick={() => setIsSearching(true)}
            className="flex items-center gap-2 bg-white text-black h-11 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 transition-all"
          >
            <Plus size={16} strokeWidth={3} /> Add Entry
          </button>
        </header>

        {/* Library Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {media.map((item) => (
            <VaultCard key={item.id} item={item} onView={setSelectedItem} onDelete={deleteMedia} />
          ))}
        </section>

        {/* --- MODALS --- */}

        {isSearching && (
          <AddSearch 
            isOpen={isSearching} 
            onClose={() => setIsSearching(false)} 
          />
        )}

        {/* Details Modal remains open even if Editing starts */}
        {selectedItem && (
          <VaultDetailsModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onEdit={() => setEditingId(selectedItem.id)} 
          />
        )}

        {/* Modify Modal sits on top (z-index 300) */}
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