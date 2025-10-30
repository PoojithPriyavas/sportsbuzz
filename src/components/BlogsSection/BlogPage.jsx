'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './BlogPage.module.css';
import Link from 'next/link';
import DynamicLink from '../Common/DynamicLink';
import Image from 'next/image';
import Head from "next/head";
import {
  FaSearch,
  FaChevronDown,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { useGlobalData } from '../Context/ApiContext';

import JoinTelegramButton from '@/components/JoinTelegram/JoinTelegramButton';
import AutoSlider from '../AutoSlider/AutoSlider';
import UpcomingFootballMatches from '@/components/UpComing/UpComingFootball';
import UpcomingMatches from '@/components/UpComing/UpComingMatches';
import BettingCard from '@/components/OddsMultiply/BettingCard';
import { usePathHelper } from '@/hooks/usePathHelper';

export default function BlogsPage({
  initialPage = 1,
  searchTerm: initialSearchTerm = '',
  categoryId: initialCategoryId = null,
  subcategoryId: initialSubcategoryId = null,
  isLocalhost = false,
}) {
  const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.sportsbuz.com';
  const router = useRouter();
  const searchParams = useSearchParams();

  // Add ref to track if component is mounted
  const isMountedRef = useRef(false);
  const lastFetchParamsRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Get data from context
  const {
    language,
    translateText,
    fetchBlogsForPage,
    countryCode,
    sport,
    upcomingMatches,
    blogsForPage,
    isLoading,
    totalBlogs,
    nextUrl,
    prevUrl,
  } = useGlobalData();

  // Parse URL parameters - these are the source of truth
  const categoryIdParam = searchParams.get('category');
  const subcategoryIdParam = searchParams.get('subcategory');
  const pageParam = searchParams.get('page');
  const searchParam = searchParams.get('search');

  // Local state - synchronized with URL params
  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : initialPage);
  const [searchTerm, setSearchTerm] = useState(searchParam || initialSearchTerm);
  const [searchInput, setSearchInput] = useState(searchParam || initialSearchTerm); // New state for input field
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categoryIdParam ? parseInt(categoryIdParam) : initialCategoryId
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(
    subcategoryIdParam ? parseInt(subcategoryIdParam) : initialSubcategoryId
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Using static translations
  const [translations] = useState({
    latestBlogs: 'Latest Blogs',
    all: 'All',
    latest: 'Latest',
    searchPlaceholder: 'Search Blogs',
    readMore: 'Read More',
    clearFilter: 'Clear Filter',
    previous: 'Previous',
    next: 'Next',
  });

  const ITEMS_PER_PAGE = 6;

  // Calculate pagination based on total count from API
  const totalPages = Math.ceil(totalBlogs / ITEMS_PER_PAGE);

  const hasActiveFilters =
    selectedCategoryId || selectedSubcategoryId || searchTerm !== '';

  // Show pagination if we have next/prev URLs or if there are multiple pages
  const showPagination = nextUrl || prevUrl || totalBlogs > ITEMS_PER_PAGE;

  // Helper function to extract page number from URL
  const getPageFromUrl = (url) => {
    if (!url) return null;
    const urlParams = new URLSearchParams(url.split('?')[1]);
    return parseInt(urlParams.get('page')) || 1;
  };

  // Get next and previous page numbers
  const nextPageNumber = getPageFromUrl(nextUrl);
  const prevPageNumber = getPageFromUrl(prevUrl);

  // CRITICAL: Sync local state with URL params whenever they change
  useEffect(() => {
    isMountedRef.current = true;

    const urlPage = pageParam ? parseInt(pageParam) : initialPage;
    const urlSearch = searchParam || initialSearchTerm;
    const urlCategory = categoryIdParam ? parseInt(categoryIdParam) : initialCategoryId;
    const urlSubcategory = subcategoryIdParam ? parseInt(subcategoryIdParam) : initialSubcategoryId;

    // Update local state if URL params have changed
    let stateChanged = false;

    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
      stateChanged = true;
    }
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
      setSearchInput(urlSearch); // Sync input field with URL
      stateChanged = true;
    }
    if (urlCategory !== selectedCategoryId) {
      setSelectedCategoryId(urlCategory);
      stateChanged = true;
    }
    if (urlSubcategory !== selectedSubcategoryId) {
      setSelectedSubcategoryId(urlSubcategory);
      stateChanged = true;
    }

    // Mark as initialized after first render
    if (!isInitialized) {
      setIsInitialized(true);
    }

    // If state changed due to URL params, reset the fetch cache
    if (stateChanged) {
      lastFetchParamsRef.current = null;
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [pageParam, searchParam, categoryIdParam, subcategoryIdParam]);

  // MAIN EFFECT FOR FETCHING BLOGS
  useEffect(() => {
    // Only proceed if ready
    if (!isMountedRef.current || !isInitialized || !countryCode?.country_code) {
      return;
    }

    const fetchParams = {
      countryCodeParam: countryCode.country_code,
      page: currentPage,
    };

    // Add optional parameters only if they have values
    if (searchTerm && searchTerm.trim()) {
      fetchParams.search = searchTerm.trim();
    }
    if (selectedCategoryId) {
      fetchParams.category = selectedCategoryId;
    }
    if (selectedSubcategoryId) {
      fetchParams.subcategory = selectedSubcategoryId;
    }

    // Create a unique key for this set of parameters
    const currentParamsKey = `${fetchParams.countryCodeParam}-${fetchParams.page}-${fetchParams.search || ''}-${fetchParams.category || ''}-${fetchParams.subcategory || ''}`;

    // Check if this exact same call was already made
    if (lastFetchParamsRef.current === currentParamsKey) {
      return;
    }

    // Store current params for future comparison
    lastFetchParamsRef.current = currentParamsKey;

    // Debounce search inputs, but not other parameter changes
    const isSearchChange = searchTerm !== searchParam;
    const debounceTime = isSearchChange ? 500 : 0;

    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current) return;

      fetchBlogsForPage(fetchParams);
    }, debounceTime);

    return () => clearTimeout(timeoutId);
  }, [
    isInitialized,
    searchTerm,
    selectedCategoryId,
    selectedSubcategoryId,
    currentPage,
    countryCode?.country_code,
    fetchBlogsForPage,
    searchParam
  ]);

  // Reset cache when country code changes
  useEffect(() => {
    if (countryCode?.country_code) {
      lastFetchParamsRef.current = null;
    }
  }, [countryCode?.country_code]);

  // Add this import at the top of the file:
  // import { usePathHelper } from '@/hooks/usePathHelper';
  const { buildPath } = usePathHelper();

  // Function to update URL without page reload
  const updateURL = (page, search, category, subcategory) => {
    if (!isMountedRef.current) return;

    const params = new URLSearchParams();

    if (search && search.trim()) params.set('search', search.trim());
    if (category) params.set('category', category.toString());
    if (subcategory) params.set('subcategory', subcategory.toString());
    if (page > 1) params.set('page', page.toString());

    const rawPath = `/blogs/pages/${page === 1 ? 'all-blogs' : `page-${page}`}${params.toString() ? `?${params.toString()}` : ''}`;

    router.push(buildPath(rawPath), { scroll: false });
  };

  const handleClearFilters = async () => {
    if (!isMountedRef.current) return;

    // Reset last fetch params to force a new fetch
    lastFetchParamsRef.current = null;

    // Clear search input field
    setSearchInput('');

    // Use path helper to safely prefix the locale and avoid duplicates
    const rawPath = `/blogs/pages/all-blogs`;
    router.replace(buildPath(rawPath), { scroll: false });
  };

  // Updated pagination handlers to use API next/prev URLs
  const handlePageChange = (pageNumber) => {
    if (!isMountedRef.current || !pageNumber) return;

    if (pageNumber !== currentPage) {
      updateURL(pageNumber, searchTerm, selectedCategoryId, selectedSubcategoryId);

      // Scroll to blog grid
      setTimeout(() => {
        if (isMountedRef.current) {
          const blogGrid = document.querySelector(`.${styles.blogGrid}`);
          if (blogGrid) {
            blogGrid.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }
      }, 100);
    }
  };

  const handlePreviousPage = () => {
    if (prevUrl && prevPageNumber) {
      handlePageChange(prevPageNumber);
    }
  };

  const handleNextPage = () => {
    if (nextUrl && nextPageNumber) {
      handlePageChange(nextPageNumber);
    }
  };

  // This now only updates the input field, doesn't trigger search
  const handleSearchChange = (e) => {
    if (!isMountedRef.current) return;
    setSearchInput(e.target.value);
  };

  // New function to actually perform the search
  const handleSearchSubmit = () => {
    if (!isMountedRef.current) return;

    // Update URL with search term and reset to page 1
    updateURL(1, searchInput, selectedCategoryId, selectedSubcategoryId);
  };

  // Handle Enter key press
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Updated page numbers generation based on current page and total pages
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        if (totalPages > 4) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        if (totalPages > 4) pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, '...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...', totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      <Head>
        {parseInt(currentPage) > 5 && (
          <meta name="robots" content="noindex,follow" />
        )}
      </Head>
      <div className={styles.container}>
        <div className={styles.fourColumnRow}>
          <div className={styles.leftThreeColumns}>
            <div className={styles.filterBar}>
              <div className={styles.controls}>
                <h2 style={{ color: 'black' }}>{translations.latestBlogs}</h2>

                <div className={styles.heading}>
                </div>

                <div className={styles.rightControls}>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className={styles.clearFilterButton}
                      disabled={isLoading}
                    >
                      <FaTimes className={styles.clearIcon} />
                      {translations.clearFilter}
                    </button>
                  )}

                  <div className={styles.searchWrapper}>
                    <input
                      type="text"
                      value={searchInput}
                      onChange={handleSearchChange}
                      onKeyPress={handleSearchKeyPress}
                      placeholder={translations.searchPlaceholder}
                      className={styles.searchInput}
                      disabled={isLoading}
                    />
                    <div onClick={handleSearchSubmit}
                      style={{
                        cursor: 'pointer',
                        //  border: '1px solid #35333359',
                        padding: '10px 12px',
                        borderRadius: '50%',
                        backgroundColor: '#35333359'
                      }}>
                      <FaSearch className={styles.searchIcon} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.blogGrid}>
              {isLoading ? (
                <div className={styles.loadingMessage}>
                  <p>Loading blogs...</p>
                </div>
              ) : !countryCode?.country_code ? (
                <div className={styles.loadingMessage}>
                  <p>Initializing...</p>
                </div>
              ) : blogsForPage && Array.isArray(blogsForPage) && blogsForPage.length > 0 ? (
                blogsForPage.map((blog, index) => (
                  <DynamicLink
                    key={`blog-${blog.id}-${currentPage}-${index}`}
                    href={`/blog-details/${blog?.slug}`}
                    className={styles.blogCard}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.blogImage}>
                      <img
                        src={blog?.image}
                        alt={blog?.alt || blog?.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className={styles.blogContent}>
                      <h5>{blog?.title}</h5>
                      <p>
                        {blog?.author} <span>{blog?.date}</span>
                      </p>
                      <span className={styles.readMore}>{translations.readMore}</span>
                    </div>
                  </DynamicLink>
                ))
              ) : (
                <div className={styles.noBlogsMessage}>
                  <p>No blogs found matching your criteria.</p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className={styles.clearFilterButton}
                      style={{ marginTop: '10px' }}
                    >
                      {translations.clearFilter}
                    </button>
                  )}
                </div>
              )}
            </div>

            {showPagination && !isLoading && (
              <div className={styles.pagination}>
                <button
                  onClick={handlePreviousPage}
                  disabled={!prevUrl}
                  className={`${styles.paginationButton} ${styles.prevNext} ${!prevUrl ? styles.disabled : ''}`}
                  aria-label="Previous page"
                >
                  <FaChevronLeft className={styles.paginationIcon} />
                  {translations.previous}
                </button>

                <div className={styles.pageNumbers}>
                  {getPageNumbers().map((page, index) =>
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        onClick={() => handlePageChange(page)}
                        className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={!nextUrl}
                  className={`${styles.paginationButton} ${styles.prevNext} ${!nextUrl ? styles.disabled : ''}`}
                  aria-label="Next page"
                >
                  {translations.next}
                  <FaChevronRight className={styles.paginationIcon} />
                </button>
              </div>
            )}
          </div>

          <div className={styles.fourthColumn}>
            <div className={styles.fourthColumnTwoColumns}>
              <div className={styles.fourthColumnLeft}>
                <JoinTelegramButton />
                <div className={styles.bettingCardWrapper}>
                  <BettingCard />
                </div>
              </div>
              <div className={styles.fourthColumnRight}>
                {sport === 'cricket' ? (
                  <UpcomingMatches upcomingMatches={upcomingMatches} />
                ) : (
                  <UpcomingFootballMatches />
                )}
              </div>
            </div>
          </div>
        </div>
      </div >
    </>
  );
}