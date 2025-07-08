// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/autoplay';

// import styles from './BlogSlider.module.css';

// export default function BlogSlider() {
//   return (
//     <div className={styles.slider}>
//       <Swiper
//         modules={[Autoplay]}
//         spaceBetween={20}
//         slidesPerView={3}
//         autoplay={{ delay: 2000, disableOnInteraction: false }}
//         loop={true}
//         breakpoints={{
//           320: { slidesPerView: 1 },
//           768: { slidesPerView: 2 },
//           1024: { slidesPerView: 3 },
//         }}
//       >
//         {[...Array(6)].map((_, i) => (
//           <SwiperSlide key={i}>
//             <div className={styles.slide}>Slide {i + 1}</div>
//           </SwiperSlide>
//         ))}
//       </Swiper>
//     </div>
//   );
// }


import React from "react";
import styles from './BlogSlider.module.css';
import { useGlobalData } from "../Context/ApiContext";

export default function BlogSlider() {
  const { recentBlogs } = useGlobalData();
  console.log(recentBlogs, "recent")
  return (
    <div className={styles.sliderWrapper}>
      {recentBlogs?.map((blog) => (
        <div key={blog.id} className={styles.blogCard}>
          {/* Image Section */}
          <div className={styles.imageSection}>
            <img
              src={`/images/blogs/${blog.slug}.jpg`} // Assuming images are named after slugs
              alt={blog.title}
              className={styles.blogImage}
            />
          </div>

          {/* Details Section */}
          <div className={styles.detailsSection}>
            <h3 className={styles.blogTitle}>{blog.title}</h3>
            <a href={`/blog/${blog.slug}`} className={styles.readMore}>Read More </a>
          </div>
        </div>
      ))}
    </div>
  );
}
