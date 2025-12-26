import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LibraryProvider } from "@/context/LibraryContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Digital Library",
  description: "Organize your book collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LibraryProvider>
            {children}
          </LibraryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}