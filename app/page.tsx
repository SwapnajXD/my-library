"use client";

import { useState } from "react";
import { useMediaStore } from "@/store/mediaStore";
import MediaCard from "@/components/media/MediaCard";
import MediaModal from "@/components/media/MediaModal";
import EditMediaModal from "@/components/media/EditMediaModal";
import AddSearch from "@/components/search/AddSearch";
import StatsView from "@/components/media/StatsView";
import { Media } from "@/types";
import { BarChart3, LayoutGrid } from "lucide-react";

export default function Page() {
  const { media, deleteMedia } = useMediaStore();
  
  // View state (Grid vs Stats)
  const [view, setView] = useState<'grid' | 'stats'>('grid');
  
  // Modal states
  const [viewingItem, setViewingItem] = useState<Media | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12 px-2">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Vault</h1>
            
            {/* View Switcher Toggle */}
            <div className="flex bg-neutral-900 p-1 rounded-full border border-neutral-800 ml-4">
              <button 
                onClick={() => setView('grid')}
                className={`p-2 rounded-full transition-all ${
                  view === 'grid' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setView('stats')}
                className={`p-2 rounded-full transition-all ${
                  view === 'stats' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
                }`}
                title="Statistics"
              >
                <BarChart3 size={16} />
              </button>
            </div>
          </div>

          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
          >
            Add New
          </button>
        </header>

        {/* Main Content Area */}
        {view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 animate-in fade-in duration-500">
            {media.map((item: Media) => (
              <MediaCard 
                key={item.id} 
                item={item} 
                onView={(it: Media) => setViewingItem(it)} 
                onDelete={(id: string) => deleteMedia(id)}
              />
            ))}
            
            {media.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-neutral-900 rounded-[40px]">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-700">
                  Your vault is empty
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatsView />
          </div>
        )}
      </div>

      {/* --- OVERLAYS --- */}

      <AddSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {viewingItem && (
        <MediaModal 
          item={viewingItem} 
          onClose={() => {
            if (!isEditing) setViewingItem(null);
          }} 
          onEdit={() => setIsEditing(true)} 
        />
      )}

      {isEditing && viewingItem && (
        <EditMediaModal 
          itemId={viewingItem.id} 
          onClose={() => setIsEditing(false)} 
        />
      )}
    </main>
  );
}