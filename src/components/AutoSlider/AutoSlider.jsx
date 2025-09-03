'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import styles from './AutoSlider.module.css';
import CustomAxios from '../utilities/CustomAxios';
import axios from 'axios';
import { useGlobalData } from '../Context/ApiContext';

export default function AutoSlider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  const { countryCode } = useGlobalData()

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://admin.sportsbuz.com/api/side-banners', {
          params: {
            country_code: countryCode?.location?.id
          }
        });
        const data = response.data;
        const countryWiseSideBanner = data.filter(data => data.location === countryCode?.location?.id)
        console.log(countryWiseSideBanner, "country wise side banner")
        setBanners(countryWiseSideBanner);
      } catch (error) {
        console.error('Error fetching side banners:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [countryCode]);

  // Restart autoplay when banners are loaded
  useEffect(() => {
    if (!loading && banners.length > 0 && swiperRef.current) {
      // Small delay to ensure Swiper is fully initialized
      setTimeout(() => {
        swiperRef.current.swiper.autoplay.start();
      }, 100);
    }
  }, [loading, banners]);

  const oddBanners = banners.filter((item, i) => (item.order_by % 2 !== 0));

  // Don't render Swiper until we have data
  if (loading || oddBanners.length === 0) {
    return (
      <div className={styles.sliderWrapper}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          Loading banners...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sliderWrapper}>
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false
        }}
        loop={oddBanners.length > 1} // Only enable loop if more than 1 slide
        pagination={{ clickable: true }}
        className={styles.slider}
        onSwiper={(swiper) => {
          // Ensure autoplay starts immediately after initialization
          swiper.autoplay.start();
        }}
      >
        {oddBanners.map(banner => (
          <SwiperSlide key={banner.id}>
            <a href={banner.url} target="_blank" rel="noopener noreferrer">
              <img src={banner.image} alt="Banner" className={styles.slideImage} />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}