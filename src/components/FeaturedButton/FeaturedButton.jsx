import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './FeaturedButton.module.css';
import { useGlobalData } from '../Context/ApiContext';

const FeaturedButton = () => {
    const { blogCategories } = useGlobalData();
    const buttonRef = useRef(null);

    // Find the featured category
    const featuredCategory = blogCategories?.find(category => category.featured === true);
    const href = featuredCategory ? `/blogs/pages/all-blogs?category=${featuredCategory.id}` : '#';

    const handleClick = (e) => {
        console.log('Featured content clicked with POWER!');

        // Create explosive ripple effect
        if (buttonRef.current) {
            const button = buttonRef.current;
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement('div');

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 237, 78, 0.8), rgba(255, 107, 107, 0.4), transparent);
        width: 20px;
        height: 20px;
        left: ${x - 10}px;
        top: ${y - 10}px;
        transform: scale(0);
        animation: explosiveRipple 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        pointer-events: none;
        z-index: 10;
      `;

            button.appendChild(ripple);

            // Create additional burst particles
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    const angle = (i / 8) * 2 * Math.PI;
                    const distance = 50 + Math.random() * 30;
                    const endX = x + Math.cos(angle) * distance;
                    const endY = y + Math.sin(angle) * distance;

                    particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: #ffed4e;
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            transform: translate(0, 0);
            animation: burstParticle 0.6s ease-out forwards;
            pointer-events: none;
            z-index: 9;
            box-shadow: 0 0 6px #ffed4e;
            --endX: ${endX - x}px;
            --endY: ${endY - y}px;
          `;

                    button.appendChild(particle);

                    setTimeout(() => {
                        if (particle.parentNode) {
                            particle.parentNode.removeChild(particle);
                        }
                    }, 600);
                }, i * 20);
            }

            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 800);
        }
    };

    // Add dynamic keyframes for animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
      @keyframes explosiveRipple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        70% {
          transform: scale(8);
          opacity: 0.6;
        }
        100% {
          transform: scale(12);
          opacity: 0;
        }
      }
      
      @keyframes burstParticle {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(var(--endX), var(--endY)) scale(0);
          opacity: 0;
        }
      }
    `;
        document.head.appendChild(style);

        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    // Add random particle motion variables
    useEffect(() => {
        if (buttonRef.current) {
            const particles = buttonRef.current.querySelectorAll('.energyParticle');
            particles.forEach((particle, index) => {
                const randomX = (Math.random() - 0.5) * 60 + 'px';
                const randomY = (Math.random() - 0.5) * 60 + 'px';
                particle.style.setProperty('--random-x', randomX);
                particle.style.setProperty('--random-y', randomY);
            });
        }
    }, []);

    return (
        <Link href={href}>
            <button
                ref={buttonRef}
                className={styles.featuredButton}
                onClick={handleClick}
                aria-label={`View featured ${featuredCategory?.name || 'content'}`}
            >
                {/* Power core */}
                <div className={styles.powerCore}></div>

                {/* Energy field */}
                <div className={styles.energyField}></div>

                {/* Lightning bolts */}
                <div className={`${styles.lightningBolt} ${styles.left}`}></div>
                <div className={`${styles.lightningBolt} ${styles.right}`}></div>

                {/* Shockwaves */}
                <div className={styles.shockwave}></div>
                <div className={styles.shockwave}></div>
                <div className={styles.shockwave}></div>

                {/* Energy particles */}
                <div className={styles.energyParticle}></div>
                <div className={styles.energyParticle}></div>
                <div className={styles.energyParticle}></div>
                <div className={styles.energyParticle}></div>
                <div className={styles.energyParticle}></div>

                {/* Button content */}
                <div className={styles.buttonContent}>
                    <span className={styles.powerIcon}>⚡</span>
                    <span>{featuredCategory?.name || 'FEATURED'}</span>
                    <span className={styles.powerIcon}>🔥</span>
                </div>
            </button>
        </Link>
    );
};

export default FeaturedButton;