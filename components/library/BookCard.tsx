import { Book } from '@/types';

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
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-slate-900/50 transition-all duration-500 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
      
      {/* Cover Image */}
      <div className="h-64 w-full overflow-hidden relative">
        <img 
          src={book.cover || fallbackImage} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
        />
        
        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md bg-white/80 ${getBadgeStyle(book.status)}`}>
            {book.status === 'toread' ? 'To Read' : book.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col grow relative">
        {/* Decorative Gradient Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            {'★'.repeat(book.rating)}<span className="text-slate-200 dark:text-slate-700">{'★'.repeat(5 - book.rating)}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{book.title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">by {book.author}</p>

        <button 
          onClick={onEdit}
          className="mt-auto w-full py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
        >
          <svg className="w-4 h-4 transition-transform group-hover/btn:scale-110" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit Details
        </button>
      </div>
    </div>
  );
}