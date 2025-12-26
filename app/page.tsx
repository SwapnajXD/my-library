"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibraryStore } from '@/store/libraryStore';
import { Book } from '@/types';
import { searchManga, MediaItem } from '@/services/malApi'; // Import MediaItem type
import { BOOK_STATUS, formatStatus } from '@/constants/library'; 
import { useTheme } from '@/context/ThemeContext';

// Components
import BookCard from '@/components/library/BookCard';
import BookModal from '@/components/library/BookModal';
import AddSearch from '@/components/search/AddSearch';

export default function Home() {
  // Hooks
  const { books, addBook, updateBook, deleteBook } = useLibraryStore();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [isAddSearchOpen, setIsAddSearchOpen] = useState(false);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) || 
                          book.author.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || book.status === filter;
    return matchesSearch && matchesFilter;
  });

  // FIX: Explicitly map 'authors' (array) to 'author' (string)
  const handleImport = (item: MediaItem) => {
    const newBook: Omit<Book, 'id'> = {
      title: item.title,
      author: item.authors[0] || 'Unknown Author', 
      status: 'toread', 
      rating: item.rating || 0, 
      cover: item.cover
    };
    addBook(newBook);
    setIsAddSearchOpen(false);
  };

  const handleManualAdd = (query: string) => {
    const tempBook: Book = {
      id: Date.now().toString(),
      title: query,
      author: '',
      status: 'toread',
      rating: 0,
      cover: ''
    };
    setEditingBook(tempBook);
    setIsBookModalOpen(true);
  };

  const handleSave = (bookData: Omit<Book, 'id'>) => {
    const isExisting = editingBook ? books.some(b => b.id === editingBook.id) : false;
    if (editingBook && isExisting) {
      updateBook(editingBook.id, bookData);
    } else {
      addBook(bookData);
    }
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setIsBookModalOpen(true);
  };

  return (
    <main className={`min-h-screen pb-12 font-sans transition-colors duration-200 
      ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-linear-to-br from-slate-50 to-slate-100 text-slate-800'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-colors duration-200
        ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/70 border-slate-200/50 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                <Plus className={`p-2 rounded-xl shadow-lg shadow-indigo-500/20 ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-linear-to-br from-indigo-600 to-violet-600 text-white'}`} />
             </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-violet-500">
                LibManager
              </h1>
              <p className={`text-xs font-semibold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Digital Collection</p>
            </div>
          </div>
          
          <div className="flex gap-3">
             {/* Theme Toggle */}
             <button 
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
            >
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddSearchOpen(true)}
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-200 border
                ${theme === 'dark' 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent' 
                  : 'bg-linear-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 text-white border-transparent'}`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Item</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center p-2">
          <div className="relative w-full md:w-96 group">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              <Search className="h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search your collection..." 
              className={`w-full pl-11 pr-4 py-3 rounded-2xl focus:shadow-lg transition-all outline-none
                ${theme === 'dark' 
                  ? 'bg-slate-900 border-none text-white focus:ring-2 focus:ring-indigo-500/50' 
                  : 'bg-white border-none text-slate-700 focus:ring-2 focus:ring-indigo-500/50'}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className={`flex p-1.5 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            {BOOK_STATUS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${
                  filter === f 
                    ? (theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 shadow-sm') 
                    : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50')
                }`}
              >
                {formatStatus(f)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence>
          {filteredBooks.length > 0 ? (
            <motion.div 
              layout
              key={filter} // Force animation on filter change
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }} // Stagger effect
                >
                  <BookCard book={book} onEdit={() => openEditModal(book)} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className={`p-6 rounded-full mb-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                <Search className={`w-12 h-12 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`} />
              </div>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>No books found</h3>
              <p className={`mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Try adjusting your filters or add a new book to get started.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddSearch 
        isOpen={isAddSearchOpen}
        onClose={() => setIsAddSearchOpen(false)}
        onImport={handleImport} // Using the fixed function
        onManualAdd={handleManualAdd}
      />

      <BookModal 
        isOpen={isBookModalOpen} 
        onClose={() => setIsBookModalOpen(false)} 
        onSave={handleSave}
        onDelete={editingBook && editingBook.id ? () => deleteBook(editingBook.id) : undefined}
        initialData={editingBook && editingBook.id ? editingBook : undefined}
      />
    </main>
  );
}