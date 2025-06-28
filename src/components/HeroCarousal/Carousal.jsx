'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import styles from './Carousal.module.css';

export default function HeroCarousal() {
  const slides = [
    '/images/hero1.jpg',
    '/images/hero2.jpg',
    '/images/hero3.jpg',
  ];

  return (
    <div className={styles.carouselWrapper} style={{marginTop:'20px'}}>
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        navigation={{
          nextEl: '.nextBtn',
          prevEl: '.prevBtn',
        }}
        className={styles.swiperContainer}
      >
        {slides.map((src, index) => (
          <SwiperSlide key={index}>
            <img src={src} className={styles.slideImage} alt={`Slide ${index + 1}`} />
          </SwiperSlide>
        ))}

        {/* Custom nav buttons */}
        <button className={`prevBtn ${styles.navBtn} ${styles.leftBtn}`}>&lt;</button>
        <button className={`nextBtn ${styles.navBtn} ${styles.rightBtn}`}>&gt;</button>
      </Swiper>
    </div>
  );
}
