'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import styles from './AutoSlider.module.css';
import CustomAxios from '../utilities/CustomAxios';

export default function AutoSlider() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await CustomAxios.get('/side-banners');
        const data = response.data;
        setBanners(data);
      } catch (error) {
        console.error('Error fetching side banners:', error);
        throw error;
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className={styles.sliderWrapper}>
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        pagination={{ clickable: true }}
        className={styles.slider}
      >
        {banners.map(banner => (
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
