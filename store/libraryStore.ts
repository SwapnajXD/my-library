import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book } from '@/types';

interface LibraryStore {
  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: string, book: Omit<Book, 'id'>) => void;
  deleteBook: (id: string) => void;
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set) => ({
      books: [],
      addBook: (bookData) =>
        set((state) => ({
          books: [
            ...state.books,
            { ...bookData, id: Date.now().toString() },
          ],
        })),
      updateBook: (id, bookData) =>
        set((state) => ({
          books: state.books.map((book) =>
            book.id === id ? { ...book, ...bookData } : book
          ),
        })),
      deleteBook: (id) =>
        set((state) => ({
          books: state.books.filter((book) => book.id !== id),
        })),
    }),
    { name: 'library-storage' }
  )
);