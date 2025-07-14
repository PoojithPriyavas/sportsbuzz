'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './BlogPage.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';
import { useGlobalData } from '../Context/ApiContext';

import TopNewsSection from '../NewsSection/TopNews';
import MultiBannerSlider from '../Multibanner/MultiBannerSlider';
import CricketPrediction from '../Betting/CricketPrediction';
import PredictionSection from '../Prediction/Prediction';
import GoogleAds from '../googleAds/GoogleAds';
import AutoSlider from '../AutoSlider/AutoSlider';

export default function BlogsPage({ blogs = [] }) {
  const [filterValue, setFilterValue] = useState("all");
  const [translations, setTranslations] = useState({
    latestBlogs: 'Latest Blogs',
    all: 'All',
    latest: 'Latest',
    searchPlaceholder: 'Search Blogs',
    readMore: 'Read More',
    clearFilter: 'Clear Filter',
  });

  const { language, translateText } = useGlobalData();

  const searchParams = useSearchParams();
  const subcategoryIdParam = searchParams.get('subcategory');
  const selectedSubcategoryId = subcategoryIdParam ? parseInt(subcategoryIdParam) : null;

  // Filter blogs by selected subcategory
  const filteredBlogs = selectedSubcategoryId
    ? blogs.filter((blog) =>
      blog.subcategory && blog.subcategory.includes(selectedSubcategoryId)
    )
    : blogs;

  // Check if any filters are active
  const hasActiveFilters = selectedSubcategoryId || filterValue !== "all";

  // Dynamic translation effect
  useEffect(() => {
    const fetchTranslations = async () => {
      const [latestBlogs, all, latest, searchPlaceholder, readMore, clearFilter] = await Promise.all([
        translateText('Latest Blogs', 'en', language),
        translateText('All', 'en', language),
        translateText('Latest', 'en', language),
        translateText('Search Blogs', 'en', language),
        translateText('Read More', 'en', language),
        translateText('Clear Filter', 'en', language),
      ]);

      setTranslations({
        latestBlogs,
        all,
        latest,
        searchPlaceholder,
        readMore,
        clearFilter,
      });
    };

    fetchTranslations();
  }, [language]);

  const handleClearFilters = () => {
    setFilterValue("all");
    // Navigate to clear subcategory filter
    window.location.href = "/blogs/pages/all-blogs";
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
                {filteredBlogs.map((blog) => (
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
            </div>
          </div>
        </div>

        <div className={styles.right}>
          {/* <PredictionSection />
          <CricketPrediction /> */}
          {/* <MultiBannerSlider /> */}
          <AutoSlider />
          <TopNewsSection />
        </div>
      </div>

      <GoogleAds />
    </>
  );
}