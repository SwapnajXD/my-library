import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MediaManager',
  description: 'Manage your personal library',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Everything inside here can now use useTheme() */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}