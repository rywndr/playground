"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, MapPin, Tag as TagIcon, Trash2, X, ChevronLeft, ChevronRight, Maximize2, Edit } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useJournalDetail } from '@/hooks/useJournalDetail';

export default function JournalDetailPage() {
  const {
    user,
    authLoading,
    journal,
    isLoading,
    error,
    isDeleting,
    router,
    handleDeleteJournal,
    retryFetch,
  } = useJournalDetail();
  
  // Media viewer state
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(-1);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  
  const openMediaViewer = (index: number) => {
    setSelectedMediaIndex(index);
    setIsViewerOpen(true);
  };
  
  const closeMediaViewer = () => {
    setIsViewerOpen(false);
  };
  
  const navigateMedia = useCallback((direction: number) => {
    if (!journal?.media?.length) return;
    
    let newIndex = selectedMediaIndex + direction;
    
    // Handle circular navigation
    if (newIndex < 0) newIndex = journal.media.length - 1;
    if (newIndex >= journal.media.length) newIndex = 0;
    
    setSelectedMediaIndex(newIndex);
  }, [journal?.media?.length, selectedMediaIndex]);

  // Keyboard nav for media viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isViewerOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeMediaViewer();
          break;
        case 'ArrowLeft':
          navigateMedia(-1);
          break;
        case 'ArrowRight':
          navigateMedia(1);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewerOpen, selectedMediaIndex, navigateMedia]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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

  if (!user && !authLoading) { // If done loading and still no user
    return null; 
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center text-center px-4">
          <p className="text-red-500 dark:text-red-400 text-lg mb-4">Error: {error}</p>
          <button 
            onClick={retryFetch} 
            className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center text-center px-4">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">Journal not found.</p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">The journal you are looking for might have been deleted or the link is incorrect.</p>
          <Link href="/gallery" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  // Main content render
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <Link 
        href="/gallery" 
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 group text-sm font-medium"
      >
        <ArrowLeft size={18} className="mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
        Back to Gallery
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight flex-1 mr-4">
              {journal.title}
            </h1>
            <div className="mt-4 sm:mt-0 flex-shrink-0 flex items-center gap-2">
              <Link
                href={`/gallery/${journal.id}/edit`}
                className="p-2.5 rounded-lg text-blue-600 hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-blue-500/10 transition-colors"
                title="Edit Journal"
              >
                <Edit size={20} />
              </Link>
              <button
                onClick={handleDeleteJournal}
                disabled={isDeleting}
                className="p-2.5 rounded-lg text-red-600 hover:bg-red-100 dark:text-red-500 dark:hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Delete Journal"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 size={20} />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar size={16} className="mr-1.5 text-gray-400 dark:text-gray-500" />
              {formatDate(journal.date)}
            </div>
            
            {journal.location && (
              <div className="flex items-center">
                <MapPin size={16} className="mr-1.5 text-gray-400 dark:text-gray-500" />
                {journal.location}
              </div>
            )}
          </div>
        </header>
        
        {journal.tags && journal.tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {journal.tags.map(tag => (
              <span 
                key={tag.id} 
                className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium shadow-sm"
              >
                <TagIcon size={14} className="mr-1.5 text-gray-400 dark:text-gray-500" />
                {tag.name}
              </span>
            ))}
          </div>
        )}
        
        {journal.media && journal.media.length > 0 && (
          <section className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {journal.media.map((mediaItem, index) => (
                <div 
                  key={mediaItem.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 cursor-pointer"
                  onClick={() => openMediaViewer(index)}
                >
                  {mediaItem.mediaType === 'VIDEO' ? (
                    <div className="relative aspect-video group">
                      <video 
                        src={mediaItem.url} 
                        className="w-full h-full object-cover"
                        preload="metadata"
                        onClick={(e) => e.stopPropagation()}
                        controls
                      />
                      <button 
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                        onClick={(e) => { e.stopPropagation(); openMediaViewer(index); }}
                      >
                        <Maximize2 size={16} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative aspect-video group">
                      <Image
                        src={mediaItem.url}
                        alt={mediaItem.caption || journal.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Maximize2 size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )}
                  {mediaItem.caption && (
                    <p className="p-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      {mediaItem.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Journal Content */}
        {journal.content && (
          <div className="mt-6 prose dark:prose-invert max-w-none whitespace-pre-wrap">
            {journal.content}
          </div>
        )}
      </article>

      {/* Media Viewer Modal */}
      {isViewerOpen && journal?.media && selectedMediaIndex >= 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="absolute inset-0 z-0" onClick={closeMediaViewer}></div>
          
          <div className="relative z-10 w-full h-full flex flex-col">
            <div className="p-4 flex justify-between items-center">
              <div className="text-white text-sm opacity-75">
                {selectedMediaIndex + 1} / {journal.media.length}
              </div>
              <button 
                onClick={closeMediaViewer}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
              <button 
                onClick={() => navigateMedia(-1)} 
                className="absolute left-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="relative max-h-full max-w-full flex items-center justify-center">
                {journal.media[selectedMediaIndex].mediaType === 'VIDEO' ? (
                  <video 
                    src={journal.media[selectedMediaIndex].url} 
                    controls 
                    autoPlay 
                    className="max-h-[80vh] max-w-full rounded"
                  />
                ) : (
                  <div className="relative" style={{ width: '80vw', height: '80vh' }}>
                    <Image
                      src={journal.media[selectedMediaIndex].url}
                      alt={journal.media[selectedMediaIndex].caption || journal.title}
                      fill
                      sizes="80vw"
                      className="object-contain"
                      priority
                    />
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => navigateMedia(1)} 
                className="absolute right-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            
            {journal.media[selectedMediaIndex].caption && (
              <div className="p-4 bg-black/50">
                <p className="text-white text-center">
                  {journal.media[selectedMediaIndex].caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}