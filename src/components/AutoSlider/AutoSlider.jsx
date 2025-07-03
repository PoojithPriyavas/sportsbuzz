'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import styles from './AutoSlider.module.css';

export default function AutoSlider() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('https://admin.sportsbuz.com/api/side-banners'); // 🔁 Replace with actual API if different
        const data = await res.json();

        // Filter and sort banners
        // const activeBanners = data
        //   .filter(b => b.is_active === 'Active' && b.location === 2)
        //   .sort((a, b) => a.order_by - b.order_by);

        setBanners(data);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };

    fetchBanners();
  }, []);

  console.log(banners,"bannerds")
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
