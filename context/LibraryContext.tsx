"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book } from '@/types';

interface LibraryContextType {
  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: string, book: Omit<Book, 'id'>) => void;
  deleteBook: (id: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider = ({ children }: { children: React.ReactNode }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('my-library-books');
    if (saved) {
      setBooks(JSON.parse(saved));
    } else {
      // Seed initial data if empty
      setBooks([
        { id: '1', title: 'The Design of Everyday Things', author: 'Don Norman', status: 'reading', rating: 5 },
        { id: '2', title: 'Clean Code', author: 'Robert C. Martin', status: 'completed', rating: 4 },
      ]);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever books change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my-library-books', JSON.stringify(books));
    }
  }, [books, isLoaded]);

  const addBook = (book: Omit<Book, 'id'>) => {
    const newBook = { ...book, id: Date.now().toString() };
    setBooks([...books, newBook]);
  };

  const updateBook = (id: string, updatedFields: Omit<Book, 'id'>) => {
    setBooks(books.map((book) => (book.id === id ? { ...book, ...updatedFields } : book)));
  };

  const deleteBook = (id: string) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  return (
    <LibraryContext.Provider value={{ books, addBook, updateBook, deleteBook }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within a LibraryProvider');
  return context;
};