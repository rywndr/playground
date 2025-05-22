"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Camera } from 'lucide-react';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect to gallery if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/gallery');
    }
  }, [user, loading, router]);

  // Don't show anything while redirecting
  if (user && !loading) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="max-w-3xl">
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">
          <span className="block">Golden Days.</span>
          <span className="block text-gray-700 dark:text-gray-300">
            Summer Captured.
          </span>
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-xl mx-auto">
          Store summer photos and journal your adventures with Amphomeus, keeping the warmth of the season alive.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <Link
            href={user ? "/gallery" : "/login"}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gray-800 hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300 text-white dark:text-gray-900 font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
          >
            <Camera size={22} />
            Explore Your Gallery
          </Link>
          <Link
            href={user ? "/journal" : "/login"}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
          >
            <BookOpen size={22} />
            Open Your Journal
          </Link>
        </div>
      </div>
    </div>
  );
}
