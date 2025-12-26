"use client";

import { useState } from "react";
import { useMediaStore } from "@/store/mediaStore";
import MediaCard from "@/components/media/MediaCard";
import MediaModal from "@/components/media/MediaModal";
import EditMediaModal from "@/components/media/EditMediaModal";
import AddSearch from "@/components/search/AddSearch";
import { Media } from "@/types";

export default function Page() {
  const { media, deleteMedia } = useMediaStore();
  const [viewingItem, setViewingItem] = useState<Media | null>(null);
  const [editingItem, setEditingItem] = useState<Media | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Library</h1>
          <button onClick={() => setIsSearchOpen(true)} className="bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">
            Add Media
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {media.map((item: Media) => (
            <MediaCard 
              key={item.id} 
              item={item} 
              onView={(it: Media) => setViewingItem(it)} 
              onEdit={(it: Media) => setEditingItem(it)}
              onDelete={(it: Media) => { if(confirm(`Remove ${it.title}?`)) deleteMedia(it.id); }}
            />
          ))}
        </div>
      </div>

      <AddSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {viewingItem && (
        <MediaModal 
          item={viewingItem} 
          onClose={() => setViewingItem(null)} 
        />
      )}

      {editingItem && (
        <EditMediaModal item={editingItem} onClose={() => setEditingItem(null)} />
      )}
    </main>
  );
}