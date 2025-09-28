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

export default function AutoSliderEven({activeEvenBanners, bannerLoading}) {
  // console.log(bannerLoading,"banner loading state")
  // const [banners, setBanners] = useState([]);
  // const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  // const { countryCode } = useGlobalData()

  // useEffect(() => {
  //   const fetchBanners = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await axios.get('https://admin.sportsbuz.com/api/side-banners', {
  //         params: {
  //           country_code: countryCode?.location?.id
  //         }
  //       });
  //       const data = response.data;
  //       const countryWiseSideBanner = data.filter(data => data.location === countryCode?.location?.id)
  //       setBanners(countryWiseSideBanner);
  //     } catch (error) {
  //       console.error('Error fetching side banners:', error);
  //       throw error;
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchBanners();
  // }, [countryCode]);

  // Remove manual autoplay control - let Swiper handle it automatically
  // useEffect(() => {
  //   if (!loading && banners.length > 0 && swiperRef.current?.swiper) {
  //     const swiper = swiperRef.current.swiper;
  //     
  //     if (swiper && swiper.autoplay && swiper.autoplay.start) {
  //       try {
  //         setTimeout(() => {
  //           if (swiper.autoplay && swiper.autoplay.start) {
  //             swiper.autoplay.start();
  //           }
  //         }, 200);
  //       } catch (error) {
  //         console.warn('Failed to start autoplay:', error);
  //       }
  //     }
  //   }
  // }, [loading, banners]);

  // const evenBanners = banners.filter((item, i) => (item.order_by % 2 === 0));
  // const activeBanners = evenBanners.filter(i => i.is_active === 'Active')

  // Don't render Swiper until we have data
  if (bannerLoading || activeEvenBanners.length === 0) {
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
        loop={activeEvenBanners.length > 1} // Only enable loop if more than 1 slide
        pagination={{ clickable: true }}
        className={styles.slider}
      // Remove onSwiper callback - autoplay should work automatically
      // onSwiper={(swiper) => {
      //   try {
      //     if (swiper && swiper.autoplay && swiper.autoplay.start) {
      //       swiper.autoplay.start();
      //     }
      //   } catch (error) {
      //     console.warn('Failed to initialize autoplay:', error);
      //   }
      // }}
      >
        {activeEvenBanners.map(banner => (

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