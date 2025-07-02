'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './Carousal.module.css';

export default function HeroCarousal() {
  const [banners, setBanners] = useState([]);

  // Fetch banner data
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('https://admin.sportsbuz.com/api/banners'); // 🔁 Replace with correct API endpoint
        const data = await res.json();
        const activeBanners = data.filter(b => b.is_active === 'Active' && b.location === 1);
        setBanners(activeBanners.sort((a, b) => a.order_by - b.order_by));
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className={styles.carouselWrapper} style={{ marginTop: '20px' }}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        pagination={{ clickable: true }}
        className={styles.swiperContainer}
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner.id}>
            <a href={banner.url} target="_blank" rel="noopener noreferrer">
              <img src={banner.image} className={styles.slideImage} alt={`Banner ${index + 1}`} />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
