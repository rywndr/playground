"use client";

import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus, Camera, Grid, ImageIcon, Search, X, 
  MoreVertical, Edit, Trash2,
  Filter as FilterIcon,
  Tag as TagIcon
} from 'lucide-react';
import { useGallery, SortOption as GallerySortOption } from '@/hooks/useGallery';
import { formatDate } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function GalleryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    journals,
    isLoading: galleryIsLoading,
    error,
    retryFetch,
    view,
    toggleView,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    allTags,
    isGalleryEmpty,
    deleteJournal, 
    sortOption,      
    setSortOption,
  } = useGallery();

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const individualDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null); 
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Click outside handler for individual card action dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (individualDropdownRef.current && !individualDropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    if (openDropdownId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  // Click outside handler for main filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen(prev => !prev);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };
  
  // Handle initial authentication loading
  if (authLoading) { 
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-400 dark:border-gray-500 border-t-gray-700 dark:border-t-gray-300 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  // After auth check, if no user (should be handled by redirect, but as a safeguard)
  if (!user) { 
    return null; 
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex-shrink-0 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Gallery</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Browse your collection of cherished moments and adventures.</p>
        </div>

        <div className="flex-grow flex sm:justify-center items-center gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search journals..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-shadow text-sm"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </form>

          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={toggleFilterDropdown}
              className={`p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-all duration-200 ease-out shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/80 flex items-center gap-2 ${selectedTags.length > 0 ? 'ring-blue-500 dark:ring-blue-400' : ''}`}
              aria-label="Open filters"
            >
              <FilterIcon size={16} strokeWidth={2.3} className={isFilterDropdownOpen || selectedTags.length > 0 ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} />
              {selectedTags.length > 0 && (
                <span className="text-xs font-medium text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 px-1.5 py-0.5 rounded-full">
                  {selectedTags.length}
                </span>
              )}
            </button>
            {isFilterDropdownOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-30 p-5 backdrop-blur-sm backdrop-filter overflow-hidden max-h-[80vh] sm:max-h-[500px] overflow-y-auto custom-scrollbar">
                <div className="relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
                    <button 
                      onClick={toggleFilterDropdown} 
                      className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sort by</label>
                    <select 
                      id="sort"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as GallerySortOption)}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-shadow text-sm"
                    >
                      <option value="date_desc">Date (Newest first)</option>
                      <option value="date_asc">Date (Oldest first)</option>
                      <option value="title_asc">Title (A-Z)</option>
                      <option value="title_desc">Title (Z-A)</option>
                    </select>
                  </div>

                  {allTags && allTags.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Tags</h4>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                        {allTags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleTagToggle(tag.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${selectedTags.includes(tag.id) 
                              ? 'bg-blue-500 text-white border-blue-500 dark:bg-blue-600 dark:border-blue-600'
                              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'}`}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {(selectedTags.length > 0) && (
                    <button 
                      onClick={clearFilters} 
                      className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-blue-500 dark:border-blue-400"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleView}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-all duration-200 ease-out shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/80"
            aria-label={view === 'grid' ? "Switch to List View" : "Switch to Grid View"}
          >
            {view === 'grid' ? (
              <ImageIcon size={20} strokeWidth={2.3} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <Grid size={20} strokeWidth={2.3} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <Link href="/gallery/new" passHref>
            <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-500 text-white rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md">
              <Plus size={18} strokeWidth={2.5} />
              Add Journal
            </button>
          </Link>
        </div>
      </div>

      {/* MODIFIED SECTION FOR JOURNAL DISPLAY */}
      {error ? ( 
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center px-4">
          <p className="text-red-500 dark:text-red-400 text-xl mb-4">Error loading journals</p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={retryFetch} 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      ) : galleryIsLoading ? ( // ADDED CHECK FOR galleryIsLoading
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Loading journals...</p>
        </div>
      ) : isGalleryEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
          <Camera size={56} className="text-gray-400 dark:text-gray-500 mb-5" />
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
            { (searchQuery || selectedTags.length > 0) ? "No journals match your filters" : "No journals yet"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
            { (searchQuery || selectedTags.length > 0) 
              ? "Try adjusting your search or filter criteria."
              : "It looks like your gallery is empty. Start capturing your summer memories and they will appear here."
            }
          </p>
          {!(searchQuery || selectedTags.length > 0) && (
            <Link href="/gallery/new" passHref>
              <button className="flex items-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-lg shadow-md">
                <Plus size={20} />
                Add Your First Journal
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className={`${view === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-6'}`
        }>
          {journals.map((journal) => (
            <div
              key={journal.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out hover:shadow-xl ${ 
                view === 'grid' ? 'hover:scale-[1.02]' : ''
              } ${ 
                view === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'
              }`}
            >
              <Link href={`/gallery/${journal.id}`} className={`${view === 'list' ? 'sm:w-2/5' : 'w-full'} block relative group`}>
                <div className={`aspect-video ${view === 'list' ? 'sm:aspect-square' : 'aspect-video'} w-full overflow-hidden`}>
                  {journal.media.length > 0 ? (
                    journal.media[0].mediaType === 'VIDEO' ? (
                      <video
                        src={journal.media[0].url}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        preload="metadata"
                      />
                    ) : (
                      <Image
                        src={journal.media[0].url}
                        alt={journal.title}
                        width={view === 'list' ? 300 : 500}
                        height={view === 'list' ? 300 : 281}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={journals.indexOf(journal) < (view === 'grid' ? 4 : 2)} // Prioritize loading for above-the-fold images
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Camera size={32} className="text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
              </Link>
              <div className={`p-5 ${view === 'list' ? 'sm:w-3/5' : 'w-full'} flex flex-col`}>
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white truncate flex-grow mr-2">
                    <Link href={`/gallery/${journal.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">
                      {journal.title}
                    </Link>
                  </h3>
                  <div className="relative flex-shrink-0" ref={openDropdownId === journal.id ? individualDropdownRef : null}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setOpenDropdownId(openDropdownId === journal.id ? null : journal.id);
                      }}
                      className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
                      aria-label="Options"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {openDropdownId === journal.id && (
                      <div
                        className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-xl ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-30 py-1"
                      >
                        <Link
                          href={`/gallery/${journal.id}/edit`}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                          onClick={() => setOpenDropdownId(null)}
                        >
                          <Edit size={15} className="mr-2.5 text-gray-500 dark:text-gray-400" />
                          Edit
                        </Link>
                        <button
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to delete this journal? This action cannot be undone.")) {
                              try {
                                await deleteJournal(journal.id);
                              } catch (err) {
                                console.error("Failed to delete journal:", err);
                              }
                            }
                            setOpenDropdownId(null); 
                          }}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <Trash2 size={15} className="mr-2.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2.5">
                  <span className="mr-3">{formatDate(journal.date)}</span>
                  {journal.location && (
                    <span className="truncate" title={journal.location}>{journal.location}</span>
                  )}
                </div>

                {journal.tags && journal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {journal.tags.slice(0, view === 'grid' ? 3 : 4).map(tag => (
                      <span 
                        key={tag.id} 
                        className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 rounded-md text-xs shadow-sm"
                      >
                        <TagIcon size={12} className="mr-1 text-gray-500 dark:text-gray-400" />
                        {tag.name}
                      </span>
                    ))}
                    {journal.tags.length > (view === 'grid' ? 3 : 4) && (
                       <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 rounded-md text-xs shadow-sm">
                         + {journal.tags.length - (view === 'grid' ? 3 : 4)}
                       </span>
                    )}
                  </div>
                )}

                {view === 'list' && journal.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-3">
                    {journal.content}
                  </p>
                )}
                
                <div className="mt-auto pt-2">
                  {(view === 'list' || (view === 'grid' && (!journal.content || journal.content.length < 50))) && ( // Show view journal if list or grid with short/no content
                     <Link href={`/gallery/${journal.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center">
                       View Journal
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 ml-1">
                         <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                       </svg>
                     </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}