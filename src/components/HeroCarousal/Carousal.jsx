'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './Carousal.module.css';
import { useMediaQuery } from 'react-responsive';

export default function HeroCarousal() {
  const [banners, setBanners] = useState([]);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Fetch banner data
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('https://admin.sportsbuz.com/api/banners'); 
        const data = await res.json();
        console.log(data," banner")
        const activeBanners = data.filter(b => b.is_active === 'Active');
        console.log(activeBanners,"active banner")
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
              <img 
                src={isMobile ? banner.mobile_image : banner.image} 
                className={styles.slideImage} 
                alt={`Banner ${index + 1}`} 
                style={{ aspectRatio: isMobile ? '3/1' : 'auto' }}
              />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}