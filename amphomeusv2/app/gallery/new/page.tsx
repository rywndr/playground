"use client";

import { useEffect } from 'react'; 
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Tag as TagIcon, X, UploadCloud } from 'lucide-react';
import { useNewJournalForm, DbTag } from '@/hooks/useNewJournalForm';

export default function NewJournalPage() {
  const {
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
  } = useNewJournalForm();

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || (!user && !authLoading)) { // loading while auth state is resolving or redirecting
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-400 border-t-gray-700 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link 
        href="/gallery" 
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Gallery
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Create New Journal
      </h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-shadow"
            placeholder="My Summer Adventure"
            required
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Location
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-shadow"
              placeholder="e.g., Beach, Mountains, City Park"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Journal Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-shadow"
            placeholder="Write about your experience, thoughts, and feelings..."
          />
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Tags
          </label>
          <div className="mb-2.5 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="flex items-center px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-sm rounded-full text-gray-700 dark:text-gray-200 shadow-sm">
                <TagIcon size={14} className="mr-1.5 text-gray-500 dark:text-gray-400" />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <X size={16} />
                </button>
              </span>
            ))}
          </div>
          <div className="relative">
            <TagIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                if (!isSuggestionsVisible) setIsSuggestionsVisible(true);
              }}
              onKeyDown={handleTagKeyDown}
              onFocus={() => setIsSuggestionsVisible(true)}
              onBlur={() => setTimeout(() => setIsSuggestionsVisible(false), 150)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-shadow"
              placeholder="Add tags (e.g., travel, food, fun)"
              autoComplete="off"
            />
            {isSuggestionsVisible && (
              <div className="absolute z-20 w-full mt-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto ring-1 ring-black ring-opacity-5">
                {dbTags
                  .filter(dbTag => 
                    dbTag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
                    !tags.includes(dbTag.name)
                  )
                  .map((suggestedTag: DbTag) => (
                    <div
                      key={suggestedTag.id}
                      onMouseDown={(e) => {
                        e.preventDefault(); 
                        handleSelectSuggestedTag(suggestedTag.name);
                      }}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer transition-colors duration-150 ease-in-out"
                    >
                      <TagIcon size={14} className="mr-2 text-gray-400 dark:text-gray-500" />
                      {suggestedTag.name}
                    </div>
                  ))}
                {dbTags.filter(dbTag => dbTag.name.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(dbTag.name)).length === 0 && tagInput.trim().length > 0 && (
                  <div className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                    No matching tags. Press Enter to create &quot;{tagInput.trim()}&quot;.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Photos & Videos
          </label>
          
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group aspect-square">
                  {files[index]?.type.startsWith('video/') ? (
                    <video 
                      src={url} 
                      className="w-full h-full object-cover rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm" 
                      controls={false}
                    />
                  ) : (
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm"
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                    aria-label="Remove media"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="fileUpload"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer 
                         bg-gray-50 dark:bg-gray-800/50 
                         hover:bg-gray-100 dark:hover:bg-gray-700/50 
                         transition-colors duration-200 ease-in-out
                         ${isDragging ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <UploadCloud size={40} className="text-gray-400 dark:text-gray-500 mb-3" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Images or Videos (MAX. 10MB per file)</p>
              </div>
              <input 
                id="fileUpload" 
                type="file" 
                className="hidden" 
                accept="image/*,video/*" 
                multiple 
                onChange={handleInputChange}
              />
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
          <Link href="/gallery">
            <button 
              type="button" 
              className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </Link>
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting || files.length === 0 && !content.trim()} // Disable if no files and no content, or submitting
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : 'Create Journal'}
          </button>
        </div>
      </form>
    </div>
  );
}
