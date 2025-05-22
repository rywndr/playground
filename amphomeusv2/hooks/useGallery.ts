"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export type Media = {
  id: string;
  url: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption?: string | null;
};

export type Tag = {
  id: string;
  name: string;
};

export type Journal = {
  id: string;
  title: string;
  date: Date;
  content?: string | null;
  location?: string | null;
  media: Media[];
  tags: Tag[];
};

export type SortOption = 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc';

type QueryState = {
  search: string;
  sort: SortOption;
  tags: string[];
};

export function useGallery() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // References for efficient loading and visibility handling
  const dataFetchedAtLeastOnce = useRef(false);
  const lastFetchedState = useRef<QueryState>({
    search: '',
    sort: 'date_desc',
    tags: []
  });
  const forceRefreshCounter = useRef(0);

  // Serializes current query state for comparison
  const getCurrentQueryState = useCallback((): QueryState => ({
    search: debouncedSearchQuery,
    sort: sortOption,
    tags: [...selectedTags].sort()
  }), [debouncedSearchQuery, sortOption, selectedTags]);

  // Check if current query state differs from last fetched state
  const haveQueryParamsChanged = useCallback(() => {
    const current = getCurrentQueryState();
    const last = lastFetchedState.current;
    
    return (
      current.search !== last.search ||
      current.sort !== last.sort ||
      current.tags.length !== last.tags.length ||
      current.tags.some((tag, i) => tag !== last.tags[i])
    );
  }, [getCurrentQueryState]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch all available tags for the filter - only once
  const fetchAllTags = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();
      setAllTags(data);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  }, [user]);

  // Fetch journals from the API
  const fetchJournals = useCallback(async (forceFetch = false) => {
    if (!user) {
      setJournals([]);
      setIsLoading(false);
      return;
    }
    
    const currentState = getCurrentQueryState();
    const shouldFetch = 
      forceFetch || 
      !dataFetchedAtLeastOnce.current || 
      forceRefreshCounter.current > 0 ||
      (
        document.visibilityState === 'visible' && 
        haveQueryParamsChanged()
      );
    
    if (!shouldFetch) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (currentState.search) params.append('search', currentState.search);
      if (currentState.sort) params.append('sort', currentState.sort);
      if (currentState.tags.length > 0) params.append('tags', currentState.tags.join(','));

      const response = await fetch(`/api/journals?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch journals');
      }
      
      const data: Journal[] = await response.json();
      setJournals(data.map((journal) => ({
        ...journal,
        date: new Date(journal.date),
      })));
      
      // Update lastFetchedState with current state
      lastFetchedState.current = currentState;
      dataFetchedAtLeastOnce.current = true;
      
      // Reset force refresh counter if it was used
      if (forceRefreshCounter.current > 0) {
        forceRefreshCounter.current = 0;
      }
    } catch (err) {
      console.error('Error fetching journals:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching journals');
    } finally {
      setIsLoading(false);
    }
  }, [user, getCurrentQueryState, haveQueryParamsChanged]);

  // Call fetchJournals when filter dependencies change
  useEffect(() => {
    fetchJournals();
  }, [fetchJournals, debouncedSearchQuery, sortOption, selectedTags]);

  // Call fetchAllTags once at initial mount
  useEffect(() => {
    if (user && !dataFetchedAtLeastOnce.current) {
      fetchAllTags();
    }
  }, [user, fetchAllTags]);

  // Handle visibility changes (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchJournals();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchJournals]);

  // Toggle view between grid and list
  const toggleView = useCallback(() => {
    setView(prevView => (prevView === 'grid' ? 'list' : 'grid'));
  }, []);

  // Retry fetching journals on error or manual refresh
  const retryFetch = useCallback(() => {
    forceRefreshCounter.current += 1;
    fetchJournals(true);
    fetchAllTags();
  }, [fetchJournals, fetchAllTags]);

  const deleteJournal = useCallback(async (journalId: string) => {
    if (!user) {
      setError("User not authenticated to delete journals.");
      return false;
    }

    try {
      const response = await fetch(`/api/journals/${journalId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete journal');
      }

      setJournals(prevJournals => prevJournals.filter(journal => journal.id !== journalId));
      return true;
    } catch (err) {
      console.error('Error deleting journal:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while deleting the journal');
      return false;
    }
  }, [user]);

  return {
    user,
    authLoading,
    view,
    journals,
    isLoading,
    error,
    router,
    toggleView,
    retryFetch,
    isGalleryEmpty: journals.length === 0 && !isLoading && !error && !debouncedSearchQuery && selectedTags.length === 0,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    selectedTags,
    setSelectedTags,
    allTags,
    deleteJournal,
  };
}
