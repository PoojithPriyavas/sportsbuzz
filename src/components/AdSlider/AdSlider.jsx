'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import styles from './AdSlider.module.css';

export default function AdsSlider() {
  const slides = [
    'Slide 1',
    'Slide 2',
    'Slide 3',
    'Slide 4',
    'Slide 5',
  ];
  return (
    <div className={styles.sliderWrapper}>
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        className={styles.swiperContainer}
      >
        {slides.map((text, idx) => (
          <SwiperSlide key={idx}>
            <div className={styles.slide}>{text}</div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
