'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './BlogPage.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaChevronDown, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useGlobalData } from '../Context/ApiContext';

import TopNewsSection from '../NewsSection/TopNews';
import MultiBannerSlider from '../Multibanner/MultiBannerSlider';
import CricketPrediction from '../Betting/CricketPrediction';
import PredictionSection from '../Prediction/Prediction';
// import GoogleAds from '../googleAds/GoogleAds';
import AutoSlider from '../AutoSlider/AutoSlider';
import JoinTelegramButton from '@/components/JoinTelegram/JoinTelegramButton';
import SportsOdsList from "@/components/SportsOdds/SportsOdsList";
import UpcomingFootballMatches from "@/components/UpComing/UpComingFootball";
import UpcomingMatches from "@/components/UpComing/UpComingMatches";
import BettingCard from '@/components/OddsMultiply/BettingCard';




export default function BlogsPage({ blogs = [] }) {
  const [filterValue, setFilterValue] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
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

  const { language, translateText } = useGlobalData();

  const searchParams = useSearchParams();
  const subcategoryIdParam = searchParams.get('subcategory');
  const selectedSubcategoryId = subcategoryIdParam ? parseInt(subcategoryIdParam) : null;

  // Constants for pagination
  const ITEMS_PER_PAGE = 6;

  // Filter blogs by selected subcategory
  const filteredBlogs = selectedSubcategoryId
    ? blogs.filter((blog) =>
      blog.subcategory && blog.subcategory.includes(selectedSubcategoryId)
    )
    : blogs;

  // Pagination calculations
  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  // Check if any filters are active
  const hasActiveFilters = selectedSubcategoryId || filterValue !== "all";

  // Show pagination if there are more than 6 blogs
  const showPagination = filteredBlogs.length > ITEMS_PER_PAGE;

  // Dynamic translation effect
  useEffect(() => {
    const fetchTranslations = async () => {
      const [latestBlogs, all, latest, searchPlaceholder, readMore, clearFilter, previous, next] = await Promise.all([
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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubcategoryId, filterValue]);

  const handleClearFilters = () => {
    setFilterValue("all");
    setCurrentPage(1);
    window.location.href = "/blogs/pages/all-blogs";
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of blog section
    document.querySelector(`.${styles.blogGrid}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, and pages around current page
      if (currentPage <= 3) {
        // Show first few pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last few pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show pages around current page
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.left}>
          <div>
            <div className={styles.filterBar}>
              <h2 style={{ color: 'black' }}>{translations.latestBlogs}</h2>
              <div className={styles.controls}>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className={styles.clearFilterButton}
                  >
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
                      <p>{blog?.author} <span>{blog?.date}</span></p>
                      <span className={styles.readMore}>{translations.readMore}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
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
                    {getPageNumbers().map((page, index) => (
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
                    ))}
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
        </div>

        <div className={styles.right}>
          <JoinTelegramButton />
          <AutoSlider />
          <BettingCard />
          <UpcomingFootballMatches />

          <UpcomingMatches />



        </div>
      </div>

      {/* <GoogleAds /> */}
    </>
  );
}