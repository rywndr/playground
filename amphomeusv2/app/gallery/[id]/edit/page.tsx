"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, X, Tag as TagIcon, UploadCloud } from "lucide-react";
import { useEditJournalForm, DbTag } from "@/hooks/useEditJournalForm";

export default function EditJournalPage() {
  const params = useParams();
  const journalId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const {
    authLoading,
    title, setTitle,
    content, setContent,
    location, setLocation,
    existingMedia,
    mediaToDelete,
    files,
    previewUrls,
    tagInput, setTagInput,
    tags,
    isLoading,
    isSubmitting,
    error: hookError,
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
  } = useEditJournalForm(journalId);

  const [filteredTags, setFilteredTags] = useState<DbTag[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter tags based on input
  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = dbTags.filter(tag => 
        tag.name.toLowerCase().includes(tagInput.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags([]);
    }
  }, [tagInput, dbTags]);
  
  const error = !journalId ? "Journal ID is missing" : hookError;

  // Error handling with missing journalId
  if (!journalId) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Error</h3>
          <p className="text-red-600 dark:text-red-300">Journal ID is missing.</p>
          <Link 
            href="/gallery"
            className="mt-4 inline-block px-4 py-2 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
          >
            Go back to gallery
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-400 dark:border-gray-500 border-t-gray-700 dark:border-t-gray-300 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading journal...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Error</h3>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <Link 
            href={`/gallery/${journalId}`}
            className="mt-4 inline-block px-4 py-2 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
          >
            Go back to journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <Link 
        href={`/gallery/${journalId}`}
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 group text-sm font-medium"
      >
        <ArrowLeft size={18} className="mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
        Back to Journal
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
        Edit Journal
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
            placeholder="Enter journal title"
          />
        </div>

        {/* Journal Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
            placeholder="Write your journal entry here..."
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location (optional)
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
            placeholder="Where were you? (e.g. Paris, France)"
          />
        </div>

s       <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Photos & Videos
          </label>

          {existingMedia.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Media</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingMedia.map((media) => {
                  if (mediaToDelete.includes(media.id || '')) return null;
                  
                  return (
                    <div key={media.id} className="group relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      {media.mediaType === 'VIDEO' ? (
                        <video 
                          src={media.url} 
                          className="w-full h-40 object-cover" 
                          controls={false}
                        />
                      ) : (
                        <Image
                          src={media.url}
                          alt={media.caption || "Existing media"}
                          width={200}
                          height={200}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => media.id && removeExistingMedia(media.id)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                        aria-label="Remove media"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {mediaToDelete.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">Media to be removed:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingMedia.filter(media => mediaToDelete.includes(media.id || '')).map((media) => (
                    <div key={media.id} className="relative rounded-lg overflow-hidden border border-red-200 dark:border-red-800 opacity-60">
                      {media.mediaType === 'VIDEO' ? (
                        <video 
                          src={media.url} 
                          className="w-full h-40 object-cover" 
                          controls={false}
                        />
                      ) : (
                        <Image
                          src={media.url}
                          alt={media.caption || "Media marked for deletion"}
                          width={200}
                          height={200}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-red-500/20"></div>
                      <button
                        type="button"
                        onClick={() => media.id && undoRemoveExistingMedia(media.id)}
                        className="absolute bottom-2 right-2 bg-gray-900/70 text-white rounded-lg px-3 py-1 text-xs hover:bg-gray-800 transition-colors"
                        aria-label="Undo remove media"
                      >
                        Undo Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

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
                  <span className="font-semibold">Click to upload new media</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Images or Videos (MAX. 10MB per file)</p>
              </div>
              <input 
                id="fileUpload" 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*,video/*" 
                multiple 
                onChange={handleInputChange}
              />
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (optional)
          </label>
          <div className="relative">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <div 
                  key={tag} 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  <TagIcon size={14} className="text-blue-500 dark:text-blue-400" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setIsSuggestionsVisible(e.target.value.trim().length > 0);
              }}
              onKeyDown={handleTagKeyDown}
              onFocus={() => {
                if (tagInput.trim().length > 0) {
                  setIsSuggestionsVisible(true);
                }
              }}
              onBlur={() => {
                // Delay hiding to allow click on suggestion
                setTimeout(() => setIsSuggestionsVisible(false), 200);
              }}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
              placeholder="Add tags (e.g. travel, summer, beach)"
            />
            {isSuggestionsVisible && filteredTags.length > 0 && (
              <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                {filteredTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200"
                    onClick={() => handleSelectSuggestedTag(tag.name)}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Press Enter to add a tag after typing
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              isSubmitting
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving Changes...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}