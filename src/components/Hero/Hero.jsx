import React from 'react';
import styles from './Hero.module.css';
// Replace with your actual image path

const HeroSection = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>CONTACT US</h1>
                <p className={styles.heroSubtitle}>
                    Get in touch with our team. We're here to help<br></br>you with any questions,
                    feedback, or partnership opportunities you may have.
                </p>
                {/* <p className={styles.heroSubtitle}>A compelling subtitle that describes your offering</p>
                <button className={styles.heroButton}>Call to Action</button> */}
            </div>
            <div className={styles.heroImageContainer}>
                <div className={styles.overlay}></div>
                <img
                    src="/contact.jpg"
                    alt="Hero visual"
                    className={styles.heroImage}
                />
            </div>

        </section>
    );
};

export default HeroSection;