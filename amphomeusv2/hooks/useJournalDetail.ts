"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

// Define types
export type Media = {
  id: string;
  url: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption: string | null;
};

export type Tag = {
  id: string;
  name: string;
};

export type Journal = {
  id: string;
  title: string;
  content: string | null;
  date: Date;
  location: string | null;
  media: Media[];
  tags: Tag[];
};

export function useJournalDetail() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const journalId = params?.id as string;

  const [journal, setJournal] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchJournalDetail = useCallback(async () => {
    if (user && journalId) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/journals/${journalId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch journal details' }));
          throw new Error(errorData.message || 'Failed to fetch journal details');
        }
        const data = await response.json();
        setJournal(data);
      } catch (err) {
        console.error('Error fetching journal details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    } else if (!user && !authLoading) {
      // If not authenticated and auth is not loading, no need to fetch
      setIsLoading(false);
    }
  }, [user, journalId, authLoading]);

  useEffect(() => {
    fetchJournalDetail();
  }, [fetchJournalDetail]);

  const handleDeleteJournal = useCallback(async () => {
    if (!journalId || !journal) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this journal? This action cannot be undone.'
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/journals/${journalId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete journal' }));
        throw new Error(errorData.error || 'Failed to delete journal');
      }
      router.push('/gallery');
    } catch (err) {
      console.error('Error deleting journal:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during deletion');
      setIsDeleting(false);
    }
  }, [journalId, journal, router]);

  const retryFetch = () => {
    fetchJournalDetail();
  };

  return {
    user,
    authLoading,
    journal,
    isLoading,
    error,
    isDeleting,
    router,
    journalId,
    handleDeleteJournal,
    retryFetch,
  };
}
