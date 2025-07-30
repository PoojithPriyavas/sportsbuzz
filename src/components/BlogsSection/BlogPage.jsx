'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './BlogPage.module.css';
import Link from 'next/link';
import Image from 'next/image';
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

export default function BlogsPage({ blogs = [] }) {
  const [filterValue, setFilterValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { language, translateText, fetchBlogs, countryCode } = useGlobalData();
  const searchParams = useSearchParams();

  // Get category and subcategory from URL params
  const categoryIdParam = searchParams.get('category');
  const selectedCategoryId = categoryIdParam ? parseInt(categoryIdParam) : null;

  const subcategoryIdParam = searchParams.get('subcategory');
  const selectedSubcategoryId = subcategoryIdParam ? parseInt(subcategoryIdParam) : null;

  const [translations, setTranslations] = useState({
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

  const totalPages = Math.ceil(blogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBlogs = blogs.slice(startIndex, endIndex);
  console.log(currentBlogs, "cyvdsbd");

  const hasActiveFilters =
    selectedCategoryId || selectedSubcategoryId || filterValue !== 'all' || searchTerm !== '';
  const showPagination = blogs.length > ITEMS_PER_PAGE;

  // Translation effect
  useEffect(() => {
    const fetchTranslations = async () => {
      const [
        latestBlogs,
        all,
        latest,
        searchPlaceholder,
        readMore,
        clearFilter,
        previous,
        next,
      ] = await Promise.all([
        translateText('Latest Blogs', 'en', language),
        translateText('All', 'en', language),
        translateText('Latest', 'en', language),
        translateText('Search Blogs', 'en', language),
        translateText('Read More', 'en', language),
        translateText('Clear Filter', 'en', language),
        translateText('Previous', 'en', language),
        translateText('Next', 'en', language),
      ]);

      setTranslations({
        latestBlogs,
        all,
        latest,
        searchPlaceholder,
        readMore,
        clearFilter,
        previous,
        next,
      });
    };

    fetchTranslations();
  }, [language]);

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, selectedSubcategoryId, filterValue, searchTerm]);

  // Fetch blogs when filters change (debounced for search)
  useEffect(() => {
    // Only fetch if we have a country code or other parameters
    if (!countryCode?.country_code && !searchTerm && !selectedCategoryId && !selectedSubcategoryId) {
      return;
    }

    const delayDebounce = setTimeout(() => {
      console.log('Fetching blogs from BlogsPage with params:', {
        countryCodeParam: countryCode?.country_code,
        search: searchTerm,
        category: selectedCategoryId,
        subcategory: selectedSubcategoryId,
      });

      fetchBlogs({
        countryCodeParam: countryCode?.country_code,
        search: searchTerm,
        category: selectedCategoryId,
        subcategory: selectedSubcategoryId,
      });
    }, searchTerm ? 500 : 0); // Only debounce for search term

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategoryId, selectedSubcategoryId, countryCode?.country_code]);

  const handleClearFilters = () => {
    setFilterValue('all');
    setSearchTerm('');
    setCurrentPage(1);
    // Redirect to clear URL params
    window.location.href = '/blogs/pages/all-blogs';
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document.querySelector(`.${styles.blogGrid}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
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
      <div className={styles.container}>
        {/* <div className={styles.left}>
          <div className={styles.filterBar}>
            <h2 style={{ color: 'black' }}>{translations.latestBlogs}</h2>
            <div className={styles.controls}>
              {hasActiveFilters && (
                <button onClick={handleClearFilters} className={styles.clearFilterButton}>
                  <FaTimes className={styles.clearIcon} />
                  {translations.clearFilter}
                </button>
              )}

              <div className={styles.selectWrapper}>
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className={styles.professionalSelect}
                >
                  <option value="all">{translations.all}</option>
                  <option value="latest">{translations.latest}</option>
                </select>
                <FaChevronDown className={styles.selectIcon} />
              </div>

              <div className={styles.searchWrapper}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={translations.searchPlaceholder}
                  className={styles.searchInput}
                />
              </div>
            </div>
          </div>

          <div className={styles.wrapper}>
            <div className={styles.blogGrid}>
              {currentBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog-details/${blog?.slug}`}
                  className={styles.blogCard}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.blogImage}>
                    <img src={blog?.image} alt={blog?.alt || blog?.title} />
                  </div>
                  <div className={styles.blogContent}>
                    <h5>{blog?.title}</h5>
                    <p>
                      {blog?.author} <span>{blog?.date}</span>
                    </p>
                    <span className={styles.readMore}>{translations.readMore}</span>
                  </div>
                </Link>
              ))}
            </div>

            {showPagination && (
              <div className={styles.pagination}>
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`${styles.paginationButton} ${styles.prevNext}`}
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
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''
                          }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`${styles.paginationButton} ${styles.prevNext}`}
                >
                  {translations.next}
                  <FaChevronRight className={styles.paginationIcon} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.right}>
          <JoinTelegramButton />
          <AutoSlider />
          <BettingCard />
          <UpcomingFootballMatches />
          <UpcomingMatches />
        </div> */}





        <div className={styles.fourColumnRow}>
          <div className={styles.leftThreeColumns}>
            <div className={styles.filterBar}>

              <div className={styles.controls}>
                <h2 style={{ color: 'black' }}>{translations.latestBlogs}</h2>
                {/* Left side - Heading */}
                <div className={styles.heading}>
                  {/* Your heading content goes here */}
                </div>

                {/* Right side - Button and Search */}
                <div className={styles.rightControls}>
                  {hasActiveFilters && (
                    <button onClick={handleClearFilters} className={styles.clearFilterButton}>
                      <FaTimes className={styles.clearIcon} />
                      {translations.clearFilter}
                    </button>
                  )}

                  {/* Uncomment if you need the select dropdown
    <div className={styles.selectWrapper}>
      <select
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        className={styles.professionalSelect}
      >
        <option value="all">{translations.all}</option>
        <option value="latest">{translations.latest}</option>
      </select>
      <FaChevronDown className={styles.selectIcon} />
    </div> */}

                  <div className={styles.searchWrapper}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={translations.searchPlaceholder}
                      className={styles.searchInput}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.blogGrid}>
              {currentBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog-details/${blog?.slug}`}
                  className={styles.blogCard}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.blogImage}>
                    <img src={blog?.image} alt={blog?.alt || blog?.title} />
                  </div>
                  <div className={styles.blogContent}>
                    <h5>{blog?.title}</h5>
                    <p>
                      {blog?.author} <span>{blog?.date}</span>
                    </p>
                    <span className={styles.readMore}>{translations.readMore}</span>
                  </div>
                </Link>
              ))}
            </div>
            {showPagination && (
              <div className={styles.pagination}>
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`${styles.paginationButton} ${styles.prevNext}`}
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
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''
                          }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`${styles.paginationButton} ${styles.prevNext}`}
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
                <UpcomingFootballMatches />
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}