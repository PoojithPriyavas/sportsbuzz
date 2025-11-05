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
import { usePathHelper } from '@/hooks/usePathHelper';
import { useRouter } from 'next/router';
import footerTranslations from './footer.json'; // Import the JSON file

const FooterTwo = () => {
    const { translateText, language, settings, sport, setSport, blogCategories } = useGlobalData();
    const { pathPrefix, buildPath } = usePathHelper();
    const router = useRouter();
    const contact = settings?.[0] || {};
    const [translatedBlogCategories, setTranslatedBlogCategories] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [translatedText, setTranslatedText] = useState({
        quickLinks: 'Quick Links',
        sports: 'Sports',
        blogCategories: 'Blog Categories',
        contactInfo: 'Contact Info',
        home: 'Home',
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
        description: 'Your ultimate destination for live cricket & football scores, match predictions, betting tips, and comprehensive sports analysis. Stay updated with the latest sports news and insights.'
    });

    // Helper function to get translation from JSON or API
    const getTranslation = async (key, defaultText) => {
        // Find the translation object for the current language
        const languageData = footerTranslations.find(item => item.hreflang === language);
        
        // If translation exists in JSON, use it
        if (languageData && languageData.translatedText[key]) {
            return languageData.translatedText[key];
        }
        
        // Otherwise, fall back to API translation
        try {
            return await translateText(defaultText, 'en', language);
        } catch (error) {
            console.error(`Error translating ${key}:`, error);
            return defaultText;
        }
    };

    // Translate blog categories individually (remains the same)
    // useEffect(() => {
    //     const translateBlogCategories = async () => {
    //         if (!blogCategories || blogCategories.length === 0) return;
            
    //         try {
    //             const translatedCategories = await Promise.all(
    //                 blogCategories.map(async (cat) => {
    //                     const translatedCatName = await translateText(cat.name, 'en', language);
    //                     const translatedSubs = await Promise.all(
    //                         (cat.subcategories || []).map(async (sub) => ({
    //                             ...sub,
    //                             name: await translateText(sub.name, 'en', language),
    //                         }))
    //                     );
    //                     return {
    //                         ...cat,
    //                         name: translatedCatName,
    //                         subcategories: translatedSubs,
    //                     };
    //                 })
    //             );
    //             setTranslatedBlogCategories(translatedCategories);
    //         } catch (error) {
    //             console.error('Error translating blog categories:', error);
    //             setTranslatedBlogCategories(blogCategories || []);
    //         }
    //     };

    //     translateBlogCategories();
    // }, [blogCategories, language, translateText]);

    // Translate footer text using JSON first, then API fallback
    useEffect(() => {
        const translateFooterTexts = async () => {
            try {
                const translations = {
                    quickLinks: await getTranslation('quickLinks', 'Quick Links'),
                    sports: await getTranslation('sports', 'Sports'),
                    blogCategories: await getTranslation('blogCategories', 'Blog Categories'),
                    contactInfo: await getTranslation('contactInfo', 'Contact Info'),
                    home: await getTranslation('home', 'Home'),
                    blogs: await getTranslation('blogs', 'Blogs'),
                    bestApps: await getTranslation('bestApps', 'Best Betting Apps'),
                    contactUs: await getTranslation('contactUs', 'Contact Us'),
                    cricket: await getTranslation('cricket', 'Cricket'),
                    football: await getTranslation('football', 'Football'),
                    featured: await getTranslation('featured', 'Featured'),
                    matchAnalysis: await getTranslation('matchAnalysis', 'Match Analysis'),
                    bettingTips: await getTranslation('bettingTips', 'Betting Tips'),
                    playerStats: await getTranslation('playerStats', 'Player Stats'),
                    news: await getTranslation('news', 'Sports News'),
                    availability: await getTranslation('availability', '24/7 Sports Updates'),
                    copyright: await getTranslation('copyright', '© 2025 SportsBuz. All rights reserved.'),
                    disclaimer: await getTranslation('disclaimer', 'Play responsibly. 18+ only. Gambling can be addictive.'),
                    terms: await getTranslation('terms', 'Terms of Use'),
                    privacy: await getTranslation('privacy', 'Privacy Policy'),
                    description: await getTranslation('description', 'Your ultimate destination for live cricket & football scores, match predictions, betting tips, and comprehensive sports analysis. Stay updated with the latest sports news and insights.')
                };

                setTranslatedText(prev => ({
                    ...prev,
                    ...translations,
                    email: contact.email || prev.email
                }));
            } catch (error) {
                console.error('Error translating footer texts:', error);
            }
        };

        translateFooterTexts();
    }, [language, contact.email]);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        
        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);
    
    const handleSportChange = (newSport) => {
        setSport(newSport);
        localStorage.setItem('selectedSport', newSport);
        if (isMobile) {
            setMobileMenuOpen(false);
        }

        // Navigate to the new sport page with pathPrefix
        router.push(buildPath(`/${newSport}`));
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Top Section */}
                <div className={styles.top}>
                    {/* Column 1 - Logo and description */}
                    <div className={styles.col}>
                        <img src="/sportsbuz.png" alt="Sportsbuz Logo" className={styles.logo} />
                        <p className={styles.description}>
                            {translatedText.description}
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
                            <li><a href={buildPath("/")}>{translatedText.home}</a></li>
                            <li><a href={buildPath("/best-betting-apps/current")}>{translatedText.bestApps}</a></li>
                            <li><a href={buildPath("/blogs/pages/all-blogs")}>{translatedText.blogs}</a></li>
                            <li><a href={buildPath("/contact")}>{translatedText.contactUs}</a></li>
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
                    {/* <div className={styles.col}>
                        <h3 className={styles.title}>{translatedText.blogCategories}</h3>
                        <ul className={styles.linkList}>
                            {translatedBlogCategories && translatedBlogCategories.length > 0 ? (
                                translatedBlogCategories.map((category) => (
                                    <li key={category.id}>
                                        <a href={buildPath(`/blogs/pages/all-blogs?category=${category.id}`)}>
                                            {category.name}
                                        </a>
                                    </li>
                                ))
                            ) : (
                                // Fallback to static categories if dynamic ones are not available
                                <>
                                    <li><a href={buildPath("/blogs/pages/all-blogs?category=1")}>{translatedText.cricket}</a></li>
                                    <li><a href={buildPath("/blogs/pages/all-blogs?category=2")}>{translatedText.football}</a></li>
                                </>
                            )}
                        </ul>
                    </div> */}

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
                        <a href={buildPath("/terms")}>{translatedText.terms}</a>
                        <a href={buildPath("/privacy")}>{translatedText.privacy}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterTwo;