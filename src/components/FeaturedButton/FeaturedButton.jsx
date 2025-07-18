import React from 'react';
import Link from 'next/link';
import styles from './FeaturedButton.module.css';
import { useGlobalData } from '../Context/ApiContext';

const FeaturedButton = () => {
    const { blogCategories } = useGlobalData();
    
    // Find the featured category
    const featuredCategory = blogCategories?.find(category => category.featured === true);
    const href = featuredCategory ? `/blogs/pages/all-blogs?subcategory=${featuredCategory.id}` : '#';
    
    const handleClick = () => {
        console.log('Featured FIFA World Cup blog clicked!');
    };

    return (
        <Link href={href}>
            <button className={styles.featuredButton} onClick={handleClick}>
            <div className={styles.pulseRing}></div>
            <div className={styles.glowEffect}></div>
            <div className={styles.buttonContent}>
                <span>FIFA World Cup</span>
            </div>
            {[...Array(5)].map((_, index) => (
                <div
                    key={index}
                    className={styles.particle}
                    style={{
                        left: `${10 + (index * 20)}%`,
                        animationDelay: `${index * 0.5}s`
                    }}
                />
            ))}
        </button>
        </Link>
    );
};

export default FeaturedButton;