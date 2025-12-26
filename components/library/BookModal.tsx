"use client";

import { useState, useEffect } from 'react';
import { Book, BookStatus } from '@/types';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Omit<Book, 'id'>) => void;
  onDelete?: () => void;
  initialData?: Book;
}

export default function BookModal({ isOpen, onClose, onSave, onDelete, initialData }: BookModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    status: 'toread' as BookStatus,
    rating: 0,
    cover: ''
  });

  useEffect(() => {
    if (initialData) {
      const { id, cover, ...rest } = initialData;
      setFormData({
        ...rest,
        cover: cover || ''
      });
    } else {
      setFormData({ title: '', author: '', status: 'toread', rating: 0, cover: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
            {initialData ? 'Edit Book' : 'Add New Book'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Title</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Author</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
              value={formData.author}
              onChange={e => setFormData({...formData, author: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Status</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none text-slate-900 dark:text-white"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as BookStatus})}
              >
                <option value="toread">To Read</option>
                <option value="reading">Reading</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Rating</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none text-slate-900 dark:text-white"
                value={formData.rating}
                onChange={e => setFormData({...formData, rating: Number(e.target.value)})}
              >
                {[0,1,2,3,4,5].map(r => <option key={r} value={r}>{r} Stars</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Cover Image URL</label>
            <input 
              type="url" 
              placeholder="https://..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
              value={formData.cover}
              onChange={e => setFormData({...formData, cover: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            {initialData && onDelete && (
              <button 
                type="button"
                onClick={() => { onDelete(); onClose(); }}
                className="px-5 py-2.5 text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                Delete
              </button>
            )}
            <div className="grow"></div>
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-8 py-2.5 bg-linear-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200">Save Book</button>
          </div>
        </form>
      </div>
    </div>
  );
}