"use client";

import { useState } from "react";
import { useMediaStore } from "@/store/mediaStore";
import MediaCard from "@/components/media/MediaCard";
import AddSearch from "@/components/search/AddSearch";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Library, X, Star, Plus } from "lucide-react";
import { Media } from "@/types";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { media, deleteMedia, updateMedia } = useMediaStore();
  
  // Modals state
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Navigation */}
      <header className="p-6 flex justify-between items-center border-b dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Library className="text-indigo-600" size={28} />
          <h1 className="text-xl font-bold dark:text-white tracking-tight">MediaManager</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            Add Media
          </button>
          
          <button 
            onClick={toggleTheme} 
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-yellow-400" />}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {/* Statistics Bar (Optional) */}
        <section className="flex gap-4 overflow-x-auto pb-2">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 min-w-35">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total</p>
            <p className="text-2xl font-black dark:text-white">{media.length}</p>
          </div>
        </section>

        {/* Library Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold dark:text-white">Your Collection</h2>
          </div>

          {media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px] text-center">
              <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-full mb-4">
                <Plus size={40} className="text-slate-300 dark:text-slate-700" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Your library is empty.</p>
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="mt-4 text-indigo-600 font-bold hover:underline"
              >
                Click here to add your first item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
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

      {/* Search Modal */}
      <AddSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white truncate pr-4">{editingItem.title}</h3>
              <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Status</label>
                <select 
                  value={editingItem.status}
                  onChange={(e) => setEditingItem({...editingItem, status: e.target.value as any})}
                  className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 dark:text-white outline-none border-2 border-transparent focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="towatch">To Watch / Read</option>
                  <option value="watching">Watching / Reading</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setEditingItem({...editingItem, rating: num})}
                      className={`flex-1 py-4 rounded-2xl flex items-center justify-center transition-all ${
                        editingItem.rating >= num ? 'bg-yellow-400 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Star size={20} fill={editingItem.rating >= num ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                Update Item
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}