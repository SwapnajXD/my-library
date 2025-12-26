"use client";
import { Book } from '@/types';
import { Edit, Trash2 } from 'lucide-react'; // Icons
import { motion } from 'framer-motion'; // Animation

interface BookCardProps {
  book: Book;
  onEdit: () => void;
}

export default function BookCard({ book, onEdit }: BookCardProps) {
  const getBadgeStyle = (status: string) => {
    switch(status) {
      case 'reading': 
        return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700';
      case 'completed': 
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
      default: 
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const fallbackImage = `https://picsum.photos/seed/${encodeURIComponent(book.title)}/400/600`;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-slate-900/50 transition-all duration-500 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full"
    >
      {/* Cover Image */}
      <div className="h-64 w-full overflow-hidden relative">
        <img 
          src={book.cover || fallbackImage} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md bg-white/80 ${getBadgeStyle(book.status)}`}>
            {book.status === 'toread' ? 'To Read' : book.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col grow relative">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            {'★'.repeat(book.rating)}<span className="text-slate-200 dark:text-slate-700">{'★'.repeat(5 - book.rating)}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{book.title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 font-medium">by {book.author}</p>

        <button 
          onClick={onEdit}
          className="mt-auto w-full py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
        >
          <Edit className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
          Edit Details
        </button>
      </div>
    </motion.div>
  );
}