import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';

import styles from './BlogSlider.module.css';

export default function BlogSlider() {
  return (
    <div className={styles.slider}>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView={3}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        loop={true}
        breakpoints={{
          320: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {[...Array(6)].map((_, i) => (
          <SwiperSlide key={i}>
            <div className={styles.slide}>Slide {i + 1}</div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
