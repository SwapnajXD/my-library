"use client";

import { useState, useMemo } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { Book } from '@/types';
import { useTheme } from '@/context/ThemeContext'; // Import Theme
import BookCard from '@/components/library/BookCard';
import BookModal from '@/components/library/BookModal';
import AddSearch from '@/components/search/AddSearch';

import { BOOK_STATUS, formatStatus } from '@/constants/library'; 

export default function Home() {
  const { theme, toggleTheme } = useTheme(); // Use Theme Hook
  const { books, addBook, updateBook, deleteBook } = useLibrary();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [isAddSearchOpen, setIsAddSearchOpen] = useState(false);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) || 
                            book.author.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || book.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [books, search, filter]);

  const handleSave = (bookData: Omit<Book, 'id'>) => {
    const isExisting = editingBook ? books.some(b => b.id === editingBook.id) : false;
    if (editingBook && isExisting) {
      updateBook(editingBook.id, bookData);
    } else {
      addBook(bookData);
    }
  };

  const handleImport = (item: any) => {
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
            <div className={`p-2 rounded-xl shadow-lg shadow-indigo-500/20
              ${theme === 'dark' ? 'bg-indigo-600' : 'bg-linear-to-br from-indigo-600 to-violet-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-violet-500">
                LibManager
              </h1>
              <p className={`text-xs font-semibold uppercase tracking-widest 
                ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Digital Collection</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-colors flex items-center justify-center
                ${theme === 'dark' ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0018 9a9 003 0 00-9-9 9 003 0 00-9 9c0 .46.04.92.125 1.354.025 1.456-1.842 2.55-4.021 2.55-6.584 0-4.269-2.372-7.848-6.359l3.532.354A6.003 6.003 0 0114.058 14H15a3.001 3.001 0 013 3v4h.791c.546 0 .994.448.994.994v.206c-.051 1.516-.987 2.8-2.405 2.8-4.526 0-4.936-3.051-6.797-6.358-.717.22-1.16-.48-1.162-1.038-.006-1.25.944-2.281 2.665-2.755a2.486 2.486 0 01-.321.992v.001zM6.5 6.5l.792.792c.39.39.902.587 1.434.587h.003a2 2 0 011.992 1.995l.792.792a6.506 6.506 0 01-4.98 4.98zM14.5 14.5l-.792-.792a2.014 2.014 0 01-.587-1.433v-.003a2 2 0 01-1.992-1.992l-.792-.792a6.506 6.506 0 014.98-4.98z" /></svg>
              )}
            </button>

            <button 
              onClick={() => setIsAddSearchOpen(true)}
              className={`group flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-200
                ${theme === 'dark' 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                  : 'bg-linear-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 text-white'}`}>
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Item
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center p-2">
          <div className="relative w-full md:w-96 group">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none
              ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              <svg className="h-5 w-5 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search your collection..." 
              className={`w-full pl-11 pr-4 py-3 rounded-2xl focus:ring-2 focus:shadow-lg transition-all outline-none
                ${theme === 'dark' 
                  ? 'bg-slate-900 border-none text-white focus:ring-indigo-500/50' 
                  : 'bg-white border-none text-slate-700 focus:ring-indigo-500/50'}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className={`flex p-1.5 rounded-2xl border
            ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            {BOOK_STATUS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${
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
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} onEdit={() => openEditModal(book)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className={`p-6 rounded-full mb-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
              <svg className={`w-12 h-12 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>No books found</h3>
            <p className={`mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Try adjusting your filters or add a new book to get started.</p>
          </div>
        )}
      </div>

      <AddSearch 
        isOpen={isAddSearchOpen}
        onClose={() => setIsAddSearchOpen(false)}
        onImport={handleImport}
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