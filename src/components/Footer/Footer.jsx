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

const FooterTwo = () => {
    const { translateText, language, settings, sport, setSport, blogCategories } = useGlobalData();
    const { pathPrefix, buildPath } = usePathHelper();
    const router = useRouter();
    const contact = settings?.[0] || {};
    const [translatedBlogCategories, setTranslatedBlogCategories] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
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
        description: 'Your ultimate destination for live cricket & football scores, match predictions, betting tips, and comprehensive sports analysis. Stay updated with the latest sports news and insights.'
    });

    // Combined translation function for both blog categories and footer text
    useEffect(() => {
        const translateFooterContent = async () => {
            if (!blogCategories) return;
            
            try {
                // Prepare all texts for translation in a single batch
                const textsToTranslate = [
                    // Static footer texts
                    { text: 'Quick Links', to: language },
                    { text: 'Sports', to: language },
                    { text: 'Blog Categories', to: language },
                    { text: 'Contact Info', to: language },
                    { text: 'Home', to: language },
                    { text: 'Blogs', to: language },
                    { text: 'Best Betting Apps', to: language },
                    { text: 'Contact Us', to: language },
                    { text: 'Cricket', to: language },
                    { text: 'Football', to: language },
                    { text: 'Featured', to: language },
                    { text: 'Match Analysis', to: language },
                    { text: 'Betting Tips', to: language },
                    { text: 'Player Stats', to: language },
                    { text: 'Sports News', to: language },
                    { text: '24/7 Sports Updates', to: language },
                    { text: '© 2025 SportsBuz. All rights reserved.', to: language },
                    { text: 'Play responsibly. 18+ only. Gambling can be addictive.', to: language },
                    { text: 'Terms of Use', to: language },
                    { text: 'Privacy Policy', to: language },
                    { text: 'Your ultimate destination for live cricket & football scores, match predictions, betting tips, and comprehensive sports analysis. Stay updated with the latest sports news and insights.', to: language }
                ];
                
                // Add blog category names and subcategory names to the translation batch
                const categoryTextIndices = {};
                const subcategoryTextIndices = {};
                
                blogCategories.forEach((category, catIndex) => {
                    const catTextIndex = textsToTranslate.length;
                    textsToTranslate.push({ text: category.name, to: language });
                    categoryTextIndices[category.id] = catTextIndex;
                    
                    if (category.subcategories && category.subcategories.length > 0) {
                        subcategoryTextIndices[category.id] = {};
                        category.subcategories.forEach((sub) => {
                            const subTextIndex = textsToTranslate.length;
                            textsToTranslate.push({ text: sub.name, to: language });
                            subcategoryTextIndices[category.id][sub.id] = subTextIndex;
                        });
                    }
                });
                
                // Make a single API call for all translations
                const allTranslations = await translateText(textsToTranslate, 'en', language);
                
                // Update footer text translations
                setTranslatedText({
                    quickLinks: allTranslations[0],
                    sports: allTranslations[1],
                    blogCategories: allTranslations[2],
                    contactInfo: allTranslations[3],
                    home: allTranslations[4],
                    blogs: allTranslations[5],
                    bestApps: allTranslations[6],
                    contactUs: allTranslations[7],
                    cricket: allTranslations[8],
                    football: allTranslations[9],
                    featured: allTranslations[10],
                    matchAnalysis: allTranslations[11],
                    bettingTips: allTranslations[12],
                    playerStats: allTranslations[13],
                    news: allTranslations[14],
                    email: contact.email || 'info@sportsbuz.com',
                    availability: allTranslations[15],
                    copyright: allTranslations[16],
                    disclaimer: allTranslations[17],
                    terms: allTranslations[18],
                    privacy: allTranslations[19],
                    description: allTranslations[20]
                });
                
                // Process blog category translations
                const translatedCategories = blogCategories.map((cat) => {
                    const translatedCatName = allTranslations[categoryTextIndices[cat.id]];
                    
                    const translatedSubs = (cat.subcategories || []).map((sub) => ({
                        ...sub,
                        name: allTranslations[subcategoryTextIndices[cat.id][sub.id]],
                    }));
                    
                    return {
                        ...cat,
                        name: translatedCatName,
                        subcategories: translatedSubs,
                    };
                });
                
                setTranslatedBlogCategories(translatedCategories);
            } catch (error) {
                console.error('Error translating footer content:', error);
                setTranslatedBlogCategories(blogCategories || []);
            }
        };

        translateFooterContent();
    }, [blogCategories, language, translateText, contact.email]);

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
                            {/* <li><a href={buildPath("/live-scores")}>{translatedText.liveScores}</a></li> */}
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
                    <div className={styles.col}>
                        <h3 className={styles.title}>{translatedText.blogCategories}</h3>
                        <ul className={styles.linkList}>
                            {translatedBlogCategories && translatedBlogCategories.length > 0 ? (
                                translatedBlogCategories.map((category) => (
                                    <li key={category.id}>
                                        <a href={buildPath(`/blogs/pages/all-blogs?category=${category.id}`)}>
                                            {category.name}
                                        </a>
                                        {/* If you want to show subcategories as well, uncomment below */}
                                        {/* {category.subcategories && category.subcategories.length > 0 && (
                                            <ul className={styles.subCategoryList}>
                                                {category.subcategories.map((sub) => (
                                                    <li key={sub.id}>
                                                        <a href={buildPath(`/blogs/pages/all-blogs?subcategory=${sub.id}`)}>
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
                                    <li><a href={buildPath("/blogs/pages/all-blogs?category=1")}>{translatedText.cricket}</a></li>
                                    <li><a href={buildPath("/blogs/pages/all-blogs?category=2")}>{translatedText.football}</a></li>
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
                        <a href={buildPath("/terms")}>{translatedText.terms}</a>
                        <a href={buildPath("/privacy")}>{translatedText.privacy}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterTwo;