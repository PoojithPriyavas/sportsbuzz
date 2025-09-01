'use client';

import { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './Carousal.module.css';
import { useMediaQuery } from 'react-responsive';

export default function HeroCarousal({countryCode}) {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const swiperRef = useRef(null);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Fetch banner data
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const url = new URL('https://admin.sportsbuz.com/api/banners');
        if (countryCode?.location?.id) {
          url.searchParams.append('country_code', countryCode.location.id);
        }
        
        const res = await fetch(url.toString());
        const data = await res.json();
        
        const activeBanners = data.filter(b => b.is_active === 'Active');
        setBanners(activeBanners.sort((a, b) => a.order_by - b.order_by));
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [countryCode]);

  // Force restart autoplay after banners are loaded
  useEffect(() => {
    if (!isLoading && banners.length > 1 && swiperRef.current) {
      const timer = setTimeout(() => {
        if (swiperRef.current?.swiper) {
          swiperRef.current.swiper.autoplay.stop();
          swiperRef.current.swiper.autoplay.start();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [banners, isLoading]);

  // Don't render if loading or no banners
  if (isLoading || banners.length === 0) {
    return <div className={styles.carouselWrapper} style={{ marginTop: '20px', height: '200px' }} />;
  }

  return (
    <div className={styles.carouselWrapper} style={{ marginTop: '20px' }}>
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        loop={banners.length > 1} // Only enable loop if more than 1 banner
        pagination={{ clickable: true }}
        className={styles.swiperContainer}
        onSwiper={(swiper) => {
          // Ensure autoplay starts after swiper is initialized
          setTimeout(() => {
            if (banners.length > 1) {
              swiper.autoplay.start();
            }
          }, 100);
        }}
        onAfterInit={(swiper) => {
          // Additional fallback to start autoplay
          if (banners.length > 1) {
            swiper.autoplay.start();
          }
        }}
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner.id}>
            <a href={banner.url} target="_blank" rel="noopener noreferrer">
              <img 
                src={isMobile ? banner.mobile_image : banner.image} 
                className={styles.slideImage} 
                alt={`Banner ${index + 1}`} 
                style={{ aspectRatio: isMobile ? '3/1' : 'auto' }}
                loading={index === 0 ? 'eager' : 'lazy'} // Load first image immediately
              />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}