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

export default function BlogsPage({
  initialPage = 1,
  searchTerm: initialSearchTerm = '',
  categoryId: initialCategoryId = null,
  subcategoryId: initialSubcategoryId = null,
  isLocalhost = false,
}) {
  const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.sportsbuz.com';
  const router = useRouter();

  // Local state
  const [filterValue, setFilterValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isInitialized, setIsInitialized] = useState(false);

  // Add ref to track if component is mounted
  const isMountedRef = useRef(false);
  const lastFetchParamsRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Get data from context
  const {
    language,
    translateText,
    fetchBlogs,
    countryCode,
    sport,
    upcomingMatches,
    blogs,
    isLoading,
    totalBlogs,
    nextUrl,
    prevUrl,
  } = useGlobalData();
  console.log(countryCode, "country code in blog")

  const searchParams = useSearchParams();

  // Get category and subcategory from URL params
  const categoryIdParam = searchParams.get('category');
  const selectedCategoryId = categoryIdParam ? parseInt(categoryIdParam) : initialCategoryId;

  const subcategoryIdParam = searchParams.get('subcategory');
  const selectedSubcategoryId = subcategoryIdParam ? parseInt(subcategoryIdParam) : initialSubcategoryId;

  // Get page from URL params
  const pageParam = searchParams.get('page');
  const urlPage = pageParam ? parseInt(pageParam) : initialPage;

  // Get search term from URL
  const searchParam = searchParams.get('search');
  const urlSearchTerm = searchParam || initialSearchTerm;

  // Using static translations instead of dynamic ones
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
    selectedCategoryId || selectedSubcategoryId || filterValue !== 'all' || searchTerm !== '';

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

  // Initialize component and sync with URL params
  useEffect(() => {
    isMountedRef.current = true;

    // Set initial state from URL params
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }

    // Mark as initialized after first render
    if (!isInitialized) {
      setIsInitialized(true);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [urlPage, urlSearchTerm, isInitialized]);

  // Remove the translation effect
  // useEffect(() => {
  //   const fetchTranslations = async () => {
  //     if (!isMountedRef.current) return;
  //
  //     try {
  //       const [
  //         latestBlogs,
  //         all,
  //         latest,
  //         searchPlaceholder,
  //         readMore,
  //         clearFilter,
  //         previous,
  //         next,
  //       ] = await Promise.all([
  //         translateText('Latest Blogs', 'en', language),
  //         translateText('All', 'en', language),
  //         translateText('Latest', 'en', language),
  //         translateText('Search Blogs', 'en', language),
  //         translateText('Read More', 'en', language),
  //         translateText('Clear Filter', 'en', language),
  //         translateText('Previous', 'en', language),
  //         translateText('Next', 'en', language),
  //       ]);
  //
  //       if (isMountedRef.current) {
  //         setTranslations({
  //           latestBlogs,
  //           all,
  //           latest,
  //           searchPlaceholder,
  //           readMore,
  //           clearFilter,
  //           previous,
  //           next,
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Translation error:', error);
  //     }
  //   };
  //
  //   fetchTranslations();
  // }, [language, translateText]);

  // SINGLE MAIN EFFECT FOR FETCHING BLOGS - PREVENTS DUPLICATE CALLS

  useEffect(() => {
    // Only proceed if:
    // 1. Component is mounted
    // 2. Component is initialized (to prevent race conditions)
    // 3. Country code is available
    if (!isMountedRef.current || !isInitialized || !countryCode?.country_code) {
      console.log('BlogsPage: Skipping blog fetch - not ready', {
        mounted: isMountedRef.current,
        initialized: isInitialized,
        countryCode: countryCode?.country_code
      });
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
      console.log('BlogsPage: Skipping duplicate fetch with same params:', currentParamsKey);
      return;
    }

    // Store current params for future comparison
    lastFetchParamsRef.current = currentParamsKey;

    // Debounce search inputs, but not other parameter changes
    const isSearchChange = searchTerm !== urlSearchTerm;
    const debounceTime = isSearchChange ? 500 : 0;

    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current) return;

      console.log('BlogsPage: Fetching blogs with params:', fetchParams);
      console.log('BlogsPage: Params key:', currentParamsKey);

      fetchBlogs(fetchParams);
    }, debounceTime);

    return () => clearTimeout(timeoutId);
  }, [
    isInitialized,
    searchTerm,
    selectedCategoryId,
    selectedSubcategoryId,
    currentPage,
    countryCode?.country_code,
    fetchBlogs,
    urlSearchTerm
  ]);


  // Function to update URL without page reload
  const updateURL = (page, search, category, subcategory) => {
    if (!isMountedRef.current) return;

    const params = new URLSearchParams();

    if (search && search.trim()) params.set('search', search);
    if (category) params.set('category', category.toString());
    if (subcategory) params.set('subcategory', subcategory.toString());
    if (page > 1) params.set('page', page.toString());

    const newURL = `/blogs/pages/${page === 1 ? 'all-blogs' : `page-${page}`}${params.toString() ? `?${params.toString()}` : ''}`;

    router.push(newURL, { scroll: false });
  };


  useEffect(() => {
    if (countryCode?.country_code) {
      // Reset the cache when country code changes
      lastFetchParamsRef.current = null;
    }
  }, [countryCode?.country_code]);

  const handleClearFilters = async () => {
    if (!isMountedRef.current) return;

    console.log('BlogsPage: Clearing filters');

    // Clear local state
    setFilterValue('all');
    setSearchTerm('');
    setCurrentPage(1);

    // Reset last fetch params to force a new fetch
    lastFetchParamsRef.current = null;

    // Get current pathname to extract the language prefix
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const languagePrefix = pathParts[1]; // e.g., 'en-in'

    // Construct the correct URL with language prefix
    const newURL = `/${languagePrefix}/blogs/pages/all-blogs`;

    // Update URL immediately
    router.replace(newURL, { scroll: false });
  };

  // Updated pagination handlers to use API next/prev URLs
  const handlePageChange = (pageNumber) => {
    if (!isMountedRef.current || !pageNumber) return;

    if (pageNumber !== currentPage) {
      console.log('BlogsPage: Changing page to:', pageNumber);
      setCurrentPage(pageNumber);
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

  const handleSearchChange = (e) => {
    if (!isMountedRef.current) return;

    const newSearchTerm = e.target.value;
    console.log('BlogsPage: Search term changed to:', newSearchTerm);
    setSearchTerm(newSearchTerm);

    // Reset page to 1 when searching
    if (currentPage !== 1) {
      setCurrentPage(1);
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

  // Debug logging effect
  useEffect(() => {
    console.log('BlogsPage State Update:', {
      blogs: blogs?.length || 0,
      isLoading,
      totalBlogs,
      currentPage,
      searchTerm,
      selectedCategoryId,
      selectedSubcategoryId,
      countryCode: countryCode?.country_code,
      hasActiveFilters,
      showPagination,
      isInitialized,
      nextUrl,
      prevUrl,
      nextPageNumber,
      prevPageNumber
    });
  }, [blogs, isLoading, totalBlogs, currentPage, searchTerm, selectedCategoryId, selectedSubcategoryId, countryCode?.country_code, hasActiveFilters, showPagination, isInitialized, nextUrl, prevUrl, nextPageNumber, prevPageNumber]);

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
                  {/* Your heading content goes here */}
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
                    <FaSearch className={styles.searchIcon} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder={translations.searchPlaceholder}
                      className={styles.searchInput}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.blogGrid}>
              {isLoading ? (
                <div className={styles.loadingMessage}>
                  <p>Loading blogs...</p>
                </div>
              ) : blogs && blogs.length > 0 ? (
                blogs.map((blog, index) => (
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
              ) : countryCode?.country_code ? (
                <div className={styles.noBlogsMessage}>
                  <p>No blogs found matching your criteria.</p>
                  {/* {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className={styles.clearFilterButton}
                      style={{ marginTop: '10px' }}
                    >
                      {translations.clearFilter}
                    </button>
                  )} */}
                </div>
              ) : (
                <div className={styles.loadingMessage}>
                  <p>Initializing...</p>
                </div>
              )}
            </div>

            {/* Updated pagination section to use API-based navigation */}
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
      </div>
    </>
  );
}