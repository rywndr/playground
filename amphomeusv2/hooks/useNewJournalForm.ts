"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export type MediaItem = {
  url: string;
  publicId: string;
  mediaType: 'IMAGE' | 'VIDEO';
  width?: number;
  height?: number;
};

export type DbTag = {
  id: string;
  name: string;
};

export function useNewJournalForm() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbTags, setDbTags] = useState<DbTag[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch existing tags from DB
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        const data = await response.json();
        setDbTags(data);
      } catch (fetchError) {
        console.error("Failed to fetch tags:", fetchError);
      }
    };
    fetchTags();
  }, []);

  // Handle file selection
  const handleFileChange = useCallback((filesToProcess: FileList | File[]) => {
    const selectedFiles = Array.from(filesToProcess);
    setFiles(prev => [...prev, ...selectedFiles.filter(f => !files.some(ef => ef.name === f.name && ef.size === f.size))]); // Avoid duplicates
    
    const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls.filter(url => !previewUrls.includes(url))]);
  }, [files, previewUrls]);

  // Wrapper for input change event
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileChange(e.target.files);
    }
  }, [handleFileChange]);

  // Remove file
  const removeFile = useCallback((index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  }, [previewUrls]);

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

  // Handle drag over event
  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  // Handle drag leave event
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // Handle drop event
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
      const mediaItems: MediaItem[] = [];
      
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
            console.error('Upload error data:', errorData);
            throw new Error(errorData.error || 'Failed to upload to Cloudinary');
          }
          
          const data = await response.json();
          const mediaType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
          
          mediaItems.push({
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
      
      const journalResponse = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, location, media: mediaItems, tags }),
      });
      
      if (!journalResponse.ok) {
        const errorData = await journalResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create journal');
      }
      
      const journalData = await journalResponse.json();
      router.push(`/gallery/${journalData.id}`);
    } catch (err) {
      console.error('Error creating journal:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsSubmitting(false);
    }
  }, [title, content, location, files, tags, router]);

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
    files,
    previewUrls,
    tagInput, setTagInput,
    tags,
    isSubmitting,
    error,
    dbTags,
    isSuggestionsVisible, setIsSuggestionsVisible,
    isDragging,
    handleInputChange,
    removeFile,
    handleTagKeyDown,
    handleRemoveTag,
    handleSelectSuggestedTag,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
  };
}
