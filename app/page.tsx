"use client";

import { useState } from "react";
import { useMediaStore } from "@/store/mediaStore";
import { useTheme } from "@/context/ThemeContext";
import MediaCard from "@/components/media/MediaCard";
import AddSearch from "@/components/search/AddSearch";
import { Sun, Moon, Library, X, Star, Plus } from "lucide-react";
import { Media } from "@/types";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { media, deleteMedia, updateMedia } = useMediaStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Media | null>(null);

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMedia(editingItem.id, editingItem);
      setEditingItem(null);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header with Neutral Borders */}
      <header className="p-6 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-900 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Library className="text-white bg-black p-1 rounded-lg dark:bg-neutral-800" size={28} />
          <h1 className="text-xl font-bold tracking-tighter">LIBRARY</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black px-5 py-2 rounded-xl font-bold active:scale-95 transition-all text-sm"
          >
            <Plus size={18} />
            ADD
          </button>
          
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-colors"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-10">
        {/* Collection Section */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500 mb-8">Collection</h2>

          {media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border border-neutral-200 dark:border-neutral-900 rounded-3xl bg-neutral-50/50 dark:bg-neutral-950/50">
              <p className="text-neutral-400 text-sm font-medium">Empty Library</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {media.map((item) => (
                <MediaCard 
                  key={item.id} 
                  item={item} 
                  onEdit={() => setEditingItem(item)} 
                  onDelete={() => deleteMedia(item.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <AddSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Edit Modal with AMOLED Grey contrast */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-lg">{editingItem.title}</h3>
              <button onClick={() => setEditingItem(null)} className="text-neutral-400 hover:text-black dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</label>
                <select 
                  value={editingItem.status}
                  onChange={(e) => setEditingItem({...editingItem, status: e.target.value as any})}
                  className="w-full p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none outline-none font-medium appearance-none"
                >
                  <option value="towatch">Plan to Watch</option>
                  <option value="watching">Currently Watching</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setEditingItem({...editingItem, rating: num})}
                      className={`flex-1 py-3 rounded-xl transition-all ${
                        editingItem.rating >= num ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm tracking-widest uppercase">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}