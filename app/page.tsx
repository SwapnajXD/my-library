"use client";

import { useState, useMemo } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { Book } from '@/types';
import BookCard from '@/components/BookCard';
import BookModal from '@/components/BookModal';
import AddSearch from '@/components/AddSearch';

export default function Home() {
  const { books, addBook, updateBook, deleteBook } = useLibrary();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  
  // States
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
    // FIX: Check if editingBook actually exists in our library to decide whether to Update or Add
    // This prevents errors when using "Add Manually" with a fake ID
    const isExisting = editingBook ? books.some(b => b.id === editingBook.id) : false;

    if (editingBook && isExisting) {
      updateBook(editingBook.id, bookData);
    } else {
      // It's a new book (either editingBook is undefined, or the ID doesn't exist yet)
      addBook(bookData);
    }
  };

  // Handle import from the Search Modal
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

  // FIX: This function was missing or undefined previously
  const handleManualAdd = (query: string) => {
    // We create a "temporary" book object to pre-fill the form
    const tempBook: Book = {
      id: Date.now().toString(), // Temporary unique ID
      title: query,              // Pre-fill title from search
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
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 text-slate-800 pb-12 font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-lg border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-br from-indigo-600 to-violet-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-500 tracking-tight">
                LibManager
              </h1>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Digital Collection</p>
            </div>
          </div>
          
          {/* SINGLE ADD BUTTON */}
          <button 
            onClick={() => setIsAddSearchOpen(true)}
            className="group flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Item
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center p-2">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search your collection..." 
              className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/50 focus:shadow-lg transition-all outline-none text-slate-700"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            {['all', 'reading', 'completed', 'toread'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${
                  filter === f 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {f === 'toread' ? 'To Read' : f}
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
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700">No books found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your filters or add a new book to get started.</p>
          </div>
        )}
      </div>

      {/* Unified Search Modal */}
      <AddSearch 
        isOpen={isAddSearchOpen}
        onClose={() => setIsAddSearchOpen(false)}
        onImport={handleImport}
        onManualAdd={handleManualAdd}
      />

      {/* Standard Form Modal */}
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