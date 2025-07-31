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
    const { translateText, language, settings, sport, setSport } = useGlobalData();

    const contact = settings?.[0] || {};
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
        disclaimer: 'Bet responsibly. 18+ only. Gambling can be addictive.',
        terms: 'Terms of Use',
        privacy: 'Privacy Policy',
    });

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
                disclaimer: 'Bet responsibly. 18+ only. Gambling can be addictive.',
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
                        {/* <ul className={styles.linkList}>
                            <li><a href="/cricket">{translatedText.cricket}</a></li>
                            <li><a href="/football">{translatedText.football}</a></li>
                        </ul> */}
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

                    {/* Column 4 - Blog Categories */}
                    <div className={styles.col}>
                        <h3 className={styles.title}>{translatedText.blogCategories}</h3>
                        <ul className={styles.linkList}>
                            <li><a href="/blogs/pages/all-blogs?category=1">{translatedText.cricket}</a></li>
                            <li><a href="/blogs/pages/all-blogs?category=2">{translatedText.football}</a></li>
                            {/* <li><a href="/blogs/betting-tips">{translatedText.bettingTips}</a></li>
                            <li><a href="/blogs/player-stats">{translatedText.playerStats}</a></li>
                            <li><a href="/blogs/news">{translatedText.news}</a></li> */}
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

                            {/* {contact.whatsapp_number && (
                                <div className={styles.contactItem}>
                                    <FaPhoneAlt className={styles.contactIcon} />
                                    <a
                                        href={`tel:${contact.whatsapp_number}`}
                                        className={styles.contactLink}
                                    >
                                        {contact.whatsapp_number}
                                    </a>
                                </div>
                            )}

                            {contact.whatsapp_number && (
                                <div className={styles.contactItem}>
                                    <FaWhatsapp className={styles.contactIcon} />
                                    <a
                                        href={`https://wa.me/${contact.whatsapp_number.replace(/[^\d]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.contactLink}
                                    >
                                        {contact.whatsapp_number}
                                    </a>
                                </div>
                            )} */}

                            <div className={styles.contactItem}>
                                <FaClock className={styles.contactIcon} />
                                <span>{translatedText.availability}</span>
                            </div>

                            {/* {contact.address && (
                                <div className={styles.contactItem}>
                                    <FaMapMarkerAlt className={styles.contactIcon} />
                                    <span>{contact.address}</span>
                                </div>
                            )} */}
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
