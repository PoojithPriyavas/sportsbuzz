'use client';

import { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './Carousal.module.css';
import { useMediaQuery } from 'react-responsive';
import { useGlobalData } from '../Context/ApiContext';

// Skeleton Loading Component
const CarouselSkeleton = ({ isMobile }) => {
  return (
    <div className={styles.carouselWrapper} style={{ marginTop: '20px' }}>
      <div className={`${styles.skeletonSlide} ${styles.shimmer}`}>
        {/* Skeleton pagination dots */}
        <div className={styles.skeletonPagination}>
          <div className={styles.skeletonDot} />
          <div className={styles.skeletonDot} />
          <div className={styles.skeletonDot} />
        </div>
      </div>
    </div>
  );
};

export default function HeroCarousal() {
  const { countryCode } = useGlobalData();
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // New state to track if we've ever loaded
  const swiperRef = useRef(null);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Fetch banner data
  useEffect(() => {
    // Skip fetching if we don't have a valid countryCode yet
    if (!countryCode?.location?.id) return;

    const fetchBanners = async () => {
      try {
        // Only show loading state on first load
        if (!hasLoaded) {
          setIsLoading(true);
        }

        const url = new URL('https://admin.sportsbuz.com/api/banners');
        url.searchParams.append('country_code', countryCode.location.id);

        const res = await fetch(url.toString());
        const data = await res.json();
        const countryWiseBanner = data.filter(b => b.location === countryCode.location.id);
        const activeBanners = countryWiseBanner.filter(b => b.is_active === 'Active');

        // Update banners
        setBanners(activeBanners.sort((a, b) => a.order_by - b.order_by));

        // Mark that we've successfully loaded data at least once
        setHasLoaded(true);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [countryCode?.location?.id, hasLoaded]); // Only depend on the specific ID, not the entire object

  // Force restart autoplay after banners are loaded
  useEffect(() => {
    if (!isLoading && banners.length > 1 && swiperRef.current?.swiper) {
      const timer = setTimeout(() => {
        const swiper = swiperRef.current?.swiper;
        if (swiper && swiper.autoplay) {
          swiper.autoplay.stop();
          swiper.autoplay.start();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [banners, isLoading]);

  // Show skeleton loading when loading and never loaded before
  if (isLoading && !hasLoaded) {
    return <CarouselSkeleton isMobile={isMobile} />;
  }

  // Don't render if no banners after loading
  // if (banners.length === 0) {
  //   return <div className={styles.carouselWrapper} style={{ marginTop: '20px' }} />;
  // }

  // Helper function to safely handle autoplay
  const handleAutoplayStart = (swiper) => {
    if (banners.length > 1 && swiper && swiper.autoplay) {
      swiper.autoplay.start();
    }
  };

  return (
    <>
      {banners.length > 0 &&
        <div className={styles.carouselWrapper} style={{ marginTop: '20px' }}>
          <Swiper
            ref={swiperRef}
            modules={[Autoplay, Navigation, Pagination]}
            autoplay={banners.length > 1 ? {
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            } : false} // Only enable autoplay if more than 1 banner
            loop={banners.length > 1} // Only enable loop if more than 1 banner
            pagination={{ clickable: true }}
            className={styles.swiperContainer}
            onSwiper={(swiper) => {
              // Ensure autoplay starts after swiper is initialized
              setTimeout(() => {
                handleAutoplayStart(swiper);
              }, 100);
            }}
            onAfterInit={(swiper) => {
              // Additional fallback to start autoplay
              handleAutoplayStart(swiper);
            }}
          >
            {banners.map((banner, index) => (
              <SwiperSlide key={banner.id}>
                <a href={banner.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={isMobile ? banner.mobile_image : banner.image}
                    className={styles.slideImage}
                    alt={`Banner ${index + 1}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>}
    </>

  );
}