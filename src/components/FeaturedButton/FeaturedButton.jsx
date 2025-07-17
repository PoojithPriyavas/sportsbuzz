import React from 'react';
import styles from './FeaturedButton.module.css';

const FeaturedButton = () => {
    const handleClick = () => {
        console.log('Featured FIFA World Cup blog clicked!');
    };

    return (

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

    );
};

export default FeaturedButton;