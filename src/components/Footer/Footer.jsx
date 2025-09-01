'use client';

import React, { useEffect, useState } from 'react';
import styles from './Footer.module.css';
import {
    FaFacebookF,
    FaTwitter,
    FaYoutube,
    FaInstagram,
    FaTelegram,
    FaLinkedin,
    FaEnvelope,
    FaMapMarkerAlt,
    FaClock,
    FaPhoneAlt,
    FaWhatsapp
} from 'react-icons/fa';
import { useGlobalData } from '../Context/ApiContext';

const FooterTwo = () => {
    const { translateText, language, settings, sport, setSport, blogCategories } = useGlobalData();

    const contact = settings?.[0] || {};
    const [translatedBlogCategories, setTranslatedBlogCategories] = useState([]);
    
    const handleSportChange = (newSport) => {
        setSport(newSport);
        localStorage.setItem('selectedSport', newSport);
        if (isMobile) {
            setMobileMenuOpen(false);
        }

        // Navigate to the new sport page
        router.push(`/${newSport}`);
    };

    const [translatedText, setTranslatedText] = useState({
        quickLinks: 'Quick Links',
        sports: 'Sports',
        blogCategories: 'Blog Categories',
        contactInfo: 'Contact Info',
        home: 'Home',
        // liveScores: 'Live Scores',
        blogs: 'Blogs',
        bestApps: 'Best Betting Apps',
        contactUs: 'Contact Us',
        cricket: 'Cricket',
        football: 'Football',
        featured: 'Featured',
        matchAnalysis: 'Match Analysis',
        bettingTips: 'Betting Tips',
        playerStats: 'Player Stats',
        news: 'Sports News',
        email: contact.email || 'info@sportsbuz.com',
        availability: '24/7 Sports Updates',
        copyright: '© 2025 SportsBuz. All rights reserved.',
        disclaimer: 'Play responsibly. 18+ only. Gambling can be addictive.',
        terms: 'Terms of Use',
        privacy: 'Privacy Policy',
    });

    // Translate blog categories
    useEffect(() => {
        const translateBlogCategories = async () => {
            if (!blogCategories || blogCategories.length === 0) return;
            
            try {
                const translatedCategories = await Promise.all(
                    blogCategories.map(async (cat) => {
                        const translatedCatName = await translateText(cat.name, 'en', language);
                        const translatedSubs = await Promise.all(
                            (cat.subcategories || []).map(async (sub) => ({
                                ...sub,
                                name: await translateText(sub.name, 'en', language),
                            }))
                        );
                        return {
                            ...cat,
                            name: translatedCatName,
                            subcategories: translatedSubs,
                        };
                    })
                );
                setTranslatedBlogCategories(translatedCategories);
            } catch (error) {
                console.error('Error translating blog categories:', error);
                setTranslatedBlogCategories(blogCategories || []);
            }
        };

        translateBlogCategories();
    }, [blogCategories, language, translateText]);

    useEffect(() => {
        const translateFooter = async () => {
            const keys = {
                quickLinks: 'Quick Links',
                sports: 'Sports',
                blogCategories: 'Blog Categories',
                contactInfo: 'Contact Info',
                home: 'Home',
                // liveScores: 'Live Scores',
                blogs: 'Blogs',
                bestApps: 'Best Betting Apps',
                contactUs: 'Contact Us',
                cricket: 'Cricket',
                football: 'Football',
                featured: 'Featured',
                matchAnalysis: 'Match Analysis',
                bettingTips: 'Betting Tips',
                playerStats: 'Player Stats',
                news: 'Sports News',
                availability: '24/7 Sports Updates',
                disclaimer: 'Play responsibly. 18+ only. Gambling can be addictive.',
                terms: 'Terms of Use',
                privacy: 'Privacy Policy',
            };

            const translated = await Promise.all(
                Object.values(keys).map((text) => translateText(text, 'en', language))
            );

            const translatedObj = {};
            Object.keys(keys).forEach((key, index) => {
                translatedObj[key] = translated[index];
            });

            setTranslatedText((prev) => ({
                ...prev,
                ...translatedObj,
                email: contact.email || prev.email,
            }));
        };

        translateFooter();
    }, [language, translateText, contact.email]);

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Top Section */}
                <div className={styles.top}>
                    {/* Column 1 - Logo and description */}
                    <div className={styles.col}>
                        <img src="/sportsbuz.png" alt="Sportsbuz Logo" className={styles.logo} />
                        <p className={styles.description}>
                            Your ultimate destination for live cricket & football scores, match predictions,
                            betting tips, and comprehensive sports analysis. Stay updated with the latest sports
                            news and insights.
                        </p>
                        <div className={styles.socialIcons}>
                            {contact.facebook_link && (
                                <a href={contact.facebook_link} target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaFacebookF /></a>
                            )}
                            {contact.twitter_link && (
                                <a href={contact.twitter_link} target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaTwitter /></a>
                            )}
                            {contact.youtube_link && (
                                <a href={contact.youtube_link} target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaYoutube /></a>
                            )}
                            {contact.instagram_link && (
                                <a href={contact.instagram_link} target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaInstagram /></a>
                            )}
                            {contact.telegram_link && (
                                <a href={contact.telegram_link} target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaTelegram /></a>
                            )}
                            {contact.linkedin_link && (
                                <a href={contact.linkedin_link} target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaLinkedin /></a>
                            )}
                        </div>
                    </div>

                    {/* Column 2 - Quick Links */}
                    <div className={styles.col}>
                        <h3 className={styles.title}>{translatedText.quickLinks}</h3>
                        <ul className={styles.linkList}>
                            <li><a href="/">{translatedText.home}</a></li>
                            {/* <li><a href="/live-scores">{translatedText.liveScores}</a></li> */}
                            <li><a href="/best-betting-apps/current">{translatedText.bestApps}</a></li>
                            <li><a href="/blogs/pages/all-blogs">{translatedText.blogs}</a></li>
                            <li><a href="/contact">{translatedText.contactUs}</a></li>
                        </ul>
                    </div>

                    {/* Column 3 - Sports Categories */}
                    <div className={styles.col}>
                        <h3 className={styles.title}>{translatedText.sports}</h3>
                        <ul className={styles.linkList}>
                            <li>
                                <button className={styles.buttonLi} onClick={() => handleSportChange('cricket')}>
                                    {translatedText.cricket}
                                </button>
                            </li>
                            <li>
                                <button className={styles.buttonLi} onClick={() => handleSportChange('football')}>
                                    {translatedText.football}
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4 - Dynamic Blog Categories */}
                    <div className={styles.col}>
                        <h3 className={styles.title}>{translatedText.blogCategories}</h3>
                        <ul className={styles.linkList}>
                            {translatedBlogCategories && translatedBlogCategories.length > 0 ? (
                                translatedBlogCategories.map((category) => (
                                    <li key={category.id}>
                                        <a href={`/blogs/pages/all-blogs?category=${category.id}`}>
                                            {category.name}
                                        </a>
                                        {/* If you want to show subcategories as well, uncomment below */}
                                        {/* {category.subcategories && category.subcategories.length > 0 && (
                                            <ul className={styles.subCategoryList}>
                                                {category.subcategories.map((sub) => (
                                                    <li key={sub.id}>
                                                        <a href={`/blogs/pages/all-blogs?subcategory=${sub.id}`}>
                                                            {sub.name}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        )} */}
                                    </li>
                                ))
                            ) : (
                                // Fallback to static categories if dynamic ones are not available
                                <>
                                    <li><a href="/blogs/pages/all-blogs?category=1">{translatedText.cricket}</a></li>
                                    <li><a href="/blogs/pages/all-blogs?category=2">{translatedText.football}</a></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Column 5 - Contact Info */}
                    <div className={styles.col}>
                        <h3 className={styles.title}>{translatedText.contactInfo}</h3>
                        <div className={styles.contactInfo}>
                            {contact.email && (
                                <div className={styles.contactItem}>
                                    <FaEnvelope className={styles.contactIcon} />
                                    <span>{contact.email}</span>
                                </div>
                            )}

                            <div className={styles.contactItem}>
                                <FaClock className={styles.contactIcon} />
                                <span>{translatedText.availability}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className={styles.bottom}>
                    <div className={styles.bottomLeft}>
                        <p>{translatedText?.copyright}</p>
                    </div>
                    <div className={styles.bottomCenter}>
                        <span className={styles.disclaimer}>
                            {translatedText?.disclaimer}
                        </span>
                    </div>
                    <div className={styles.bottomRight}>
                        <a href="/terms">{translatedText.terms}</a>
                        <a href="/privacy">{translatedText.privacy}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterTwo;