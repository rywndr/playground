'use client';

import Link from 'next/link';
import { LogOut, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg rounded-xl mx-auto max-w-7xl my-4 w-full">
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white">
          Amphomeus
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                Welcome, {user.email?.split('@')[0]}
              </span>
              <button
                onClick={signOut}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                <LogOut size={18} />
                {loading && user ? 'Logging out...' : 'Logout'}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              <UserCircle2 size={18} />
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
