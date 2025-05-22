"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export type MediaItem = {
  id?: string;
  url: string;
  publicId: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption?: string | null;
  width?: number;
  height?: number;
};

export type DbTag = {
  id: string;
  name: string;
};

export type Journal = {
  id: string;
  title: string;
  content?: string | null;
  date: Date;
  location?: string | null;
  media: MediaItem[];
  tags: DbTag[];
};

export function useEditJournalForm(journalId: string | undefined | null) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [originalJournal, setOriginalJournal] = useState<Journal | null>(null);
  
  // Media state
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>([]);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]); // Array of media IDs to delete
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Tags state
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [dbTags, setDbTags] = useState<DbTag[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch journal data and existing tags
  useEffect(() => {
    const fetchJournalAndTags = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!journalId) {
          throw new Error('Journal ID is required');
        }
        
        // Fetch journal data
        const journalResponse = await fetch(`/api/journals/${journalId}`);
        if (!journalResponse.ok) {
          throw new Error('Failed to fetch journal');
        }
        
        const journalData = await journalResponse.json();
        setOriginalJournal(journalData);
        
        // Set form data from journal
        setTitle(journalData.title);
        setContent(journalData.content || '');
        setLocation(journalData.location || '');
        setDate(new Date(journalData.date));
        setExistingMedia(journalData.media || []);
        
        // Set tags from journal
        setTags(journalData.tags.map((tag: DbTag) => tag.name));
        
        // Fetch all available tags
        const tagsResponse = await fetch('/api/tags');
        if (!tagsResponse.ok) {
          throw new Error('Failed to fetch tags');
        }
        
        const tagsData = await tagsResponse.json();
        setDbTags(tagsData);
      } catch (fetchError) {
        console.error('Error fetching data:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (journalId) {
      fetchJournalAndTags();
    }
  }, [journalId]);

  // Handle file selection
  const handleFileChange = useCallback((filesToProcess: FileList | File[]) => {
    const selectedFiles = Array.from(filesToProcess);
    setFiles(prev => [...prev, ...selectedFiles.filter(f => !files.some(ef => ef.name === f.name && ef.size === f.size))]);
    
    const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  }, [files]);

  // Wrapper for input change event
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileChange(e.target.files);
    }
  }, [handleFileChange]);

  // Remove new file
  const removeFile = useCallback((index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  }, [previewUrls]);

  // Mark existing media for deletion
  const removeExistingMedia = useCallback((mediaId: string) => {
    setMediaToDelete(prev => [...prev, mediaId]);
  }, []);

  // Undo marking media for deletion
  const undoRemoveExistingMedia = useCallback((mediaId: string) => {
    setMediaToDelete(prev => prev.filter(id => id !== mediaId));
  }, []);

  // Handle tag input
  const handleTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags(prevTags => [...prevTags, newTag]);
      }
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  }, []);

  const handleSelectSuggestedTag = useCallback((tagName: string) => {
    if (!tags.includes(tagName)) {
      setTags(prevTags => [...prevTags, tagName]);
    }
    setTagInput('');
    setIsSuggestionsVisible(false);
  }, [tags]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [handleFileChange]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please provide a title for your journal');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Upload new media files if any
      const newMediaItems: MediaItem[] = [];
      
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/cloudinary/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to upload file');
          }
          
          const data = await response.json();
          const mediaType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
          
          newMediaItems.push({
            url: data.secure_url,
            publicId: data.public_id,
            mediaType,
            width: data.width,
            height: data.height,
          });
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          setError(`Failed to upload file: ${file.name}. Please try again or remove the file.`);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Delete media marked for deletion
      for (const mediaId of mediaToDelete) {
        const mediaToDelete = existingMedia.find(m => m.id === mediaId);
        if (mediaToDelete?.publicId) {
          try {
            await fetch(`/api/cloudinary/delete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicId: mediaToDelete.publicId }),
            });
          } catch (deleteError) {
            console.error('Error deleting media from Cloudinary:', deleteError);
            // Continue with update even if some media deletion fails
          }
        }
      }
      
      // Prepare remaining existing media
      const remainingMedia = existingMedia
        .filter(m => !mediaToDelete.includes(m.id || ''))
        .map(m => ({
          id: m.id,
          url: m.url,
          publicId: m.publicId,
          mediaType: m.mediaType,
          caption: m.caption,
          width: m.width,
          height: m.height
        }));
      
      // Update journal
      const journalUpdateData = {
        title,
        content,
        location,
        media: [...remainingMedia, ...newMediaItems],
        tags,
        mediaToDelete
      };
      
      const updateResponse = await fetch(`/api/journals/${journalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(journalUpdateData),
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update journal');
      }
      
      // Redirect to journal detail page after successful update
      router.push(`/gallery/${journalId}`);
    } catch (err) {
      console.error('Error updating journal:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsSubmitting(false);
    }
  }, [title, content, location, files, tags, journalId, existingMedia, mediaToDelete, router]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return {
    user,
    authLoading,
    title, setTitle,
    content, setContent,
    location, setLocation,
    date,
    originalJournal,
    existingMedia,
    mediaToDelete,
    files,
    previewUrls,
    tagInput, setTagInput,
    tags,
    isLoading,
    isSubmitting,
    error,
    dbTags,
    isSuggestionsVisible, setIsSuggestionsVisible,
    isDragging,
    handleInputChange,
    removeFile,
    removeExistingMedia,
    undoRemoveExistingMedia,
    handleTagKeyDown,
    handleRemoveTag,
    handleSelectSuggestedTag,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
  };
}