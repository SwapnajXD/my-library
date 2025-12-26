"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, BookOpen, MonitorPlay, Clapperboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Media, MediaType, MediaStatus } from '@/types';

// Updated Zod Schema matching new Media type
const mediaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  creator: z.string().min(1, "Creator is required"), // CHANGED FROM author
  status: z.enum(['reading', 'watching', 'completed', 'toread', 'towatch']),
  rating: z.number().min(0).max(5),
  poster: z.string().optional(), // CHANGED FROM cover
  type: z.enum(['manga', 'anime', 'movie', 'tv']),
  year: z.number().optional(),
  synopsis: z.string().optional(),
});

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: Omit<Media, 'id'>) => void;
  onDelete?: () => void;
  initialData?: Media;
}

export default function MediaModal({ isOpen, onClose, onSave, onDelete, initialData }: MediaModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Media, 'id'>>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      title: '',
      creator: '',
      status: 'towatch',
      rating: 0,
      poster: '', // CHANGED FROM cover
      type: 'manga', // Added default type
      year: undefined,
      synopsis: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ title: '', creator: '', status: 'towatch', rating: 0, poster: '', type: 'manga', year: undefined, synopsis: '' });
    }
  }, [initialData, reset, isOpen]);

  const onFormSubmit = (data: Omit<Media, 'id'>) => {
    onSave(data);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
                {initialData ? 'Edit Media' : 'Add New Media'}
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Title</label>
                  <input 
                    {...register('title')} 
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${errors.title ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                  />
                  {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
                </div>
                
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Creator</label>
                  <input 
                    {...register('creator')} 
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm ${errors.creator ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                  />
                  {errors.creator && <span className="text-red-500 text-xs">{errors.creator.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Type</label>
                  <select 
                    {...register('type')}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:outline-none transition-all appearance-none text-sm"
                  >
                    <option value="manga">Manga</option>
                    <option value="anime">Anime</option>
                    <option value="movie">Movie</option>
                    <option value="tv">TV Series</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Status</label>
                  <select 
                    {...register('status')}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:outline-none transition-all appearance-none text-sm"
                  >
                    <option value="towatch">To Watch</option>
                    <option value="watching">Watching</option>
                    <option value="completed">Completed</option>
                    <option value="toread">To Read</option>
                    <option value="reading">Reading</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Rating</label>
                  <select 
                    {...register('rating', { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:outline-none transition-all appearance-none text-sm"
                  >
                    {[0,1,2,3,4,5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Year</label>
                  <input 
                    type="number"
                    {...register('year', { valueAsNumber: true })}
                    placeholder="YYYY"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Poster URL</label>
                  <input 
                    {...register('poster')} 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:outline-none transition-all text-sm"
                  />
              </div>

              <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Synopsis</label>
                  <textarea 
                    {...register('synopsis')}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:outline-none transition-all text-sm"
                  />
              </div>

              <div className="flex items-center gap-3 pt-2">
                {initialData && onDelete && (
                  <button 
                    type="button"
                    onClick={() => { onDelete(); onClose(); }}
                    className="px-4 py-2 text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm"
                  >
                    Delete
                  </button>
                )}
                <div className="grow"></div>
                <button type="button" onClick={onClose} className="px-5 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-linear-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 text-sm">Save</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
