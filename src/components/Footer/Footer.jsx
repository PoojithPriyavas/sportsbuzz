import React from 'react';
import styles from './Footer.module.css';
import {
    FaFacebookF,
    FaTwitter,
    FaYoutube,
    FaInstagram,
    FaTelegram,
    FaLinkedin,
    FaPhone,
    FaEnvelope,
    FaClock,
    FaMapMarkerAlt,
    FaFootballBall
} from 'react-icons/fa';

const FooterTwo = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Top Section */}
                <div className={styles.top}>
                    {/* Column 1 - Logo and description */}
                    <div className={styles.col}>
                        {/* <div className={styles.logo}>
                            <FaFootballBall className={styles.logoIcon} />
                            <span className={styles.logoText}>SportsBuz</span>
                        </div> */}
                        <img src="/sportsbuz.png" alt="Sportsbuz Logo" className={styles.logo} />

                        <p className={styles.description}>
                            Your ultimate destination for live cricket & football scores, match predictions, betting tips, and comprehensive sports analysis. Stay updated with the latest sports news and insights.
                        </p>
                        <div className={styles.socialIcons}>
                            <a href="#" className={styles.socialLink}><FaFacebookF /></a>
                            <a href="#" className={styles.socialLink}><FaTwitter /></a>
                            <a href="#" className={styles.socialLink}><FaYoutube /></a>
                            <a href="#" className={styles.socialLink}><FaInstagram /></a>
                            <a href="#" className={styles.socialLink}><FaTelegram /></a>
                            <a href="#" className={styles.socialLink}><FaLinkedin /></a>
                        </div>
                    </div>

                    {/* Column 2 - Quick Links */}
                    <div className={styles.col}>
                        <h3 className={styles.title}>Quick Links</h3>
                        <ul className={styles.linkList}>
                            <li><a href="/">Home</a></li>
                            <li><a href="/live-scores">Live Scores</a></li>
                            {/* <li><a href="/predictions">Match Predictions</a></li> */}
                            <li><a href="/betting-apps">Best Betting Apps</a></li>
                            <li><a href="/contact">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Column 3 - Sports Categories */}
                    <div className={styles.col}>
                        <h3 className={styles.title}>Sports</h3>
                        <ul className={styles.linkList}>
                            <li><a href="/cricket">Cricket</a></li>
                            <li><a href="/football">Football</a></li>

                        </ul>
                    </div>

                    {/* Column 4 - Blog Categories */}
                    <div className={styles.col}>
                        <h3 className={styles.title}>Blog Categories</h3>
                        <ul className={styles.linkList}>
                            <li><a href="/blogs/featured">Featured</a></li>
                            <li><a href="/blogs/match-analysis">Match Analysis</a></li>
                            <li><a href="/blogs/betting-tips">Betting Tips</a></li>
                            <li><a href="/blogs/player-stats">Player Stats</a></li>
                            <li><a href="/blogs/news">Sports News</a></li>
                        </ul>
                    </div>

                    {/* Column 5 - Contact Info */}
                    <div className={styles.col}>
                        <h3 className={styles.title}>Contact Info</h3>
                        <div className={styles.contactInfo}>
                            <div className={styles.contactItem}>
                                <FaEnvelope className={styles.contactIcon} />
                                <span>info@sportsbuz.com</span>
                            </div>
                            {/* <div className={styles.contactItem}>
                                <FaPhone className={styles.contactIcon} />
                                <span>+1 (555) 123-4567</span>
                            </div> */}
                            <div className={styles.contactItem}>
                                <FaClock className={styles.contactIcon} />
                                <span>24/7 Sports Updates</span>
                            </div>
                            {/* <div className={styles.contactItem}>
                                <FaMapMarkerAlt className={styles.contactIcon} />
                                <span>Global Sports Coverage</span>
                            </div> */}
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className={styles.bottom}>
                    <div className={styles.bottomLeft}>
                        <p>&copy; 2025 SportsBuz. All rights reserved.</p>
                    </div>
                    <div className={styles.bottomCenter}>
                        <span className={styles.disclaimer}>
                            Bet responsibly. 18+ only. Gambling can be addictive.
                        </span>
                    </div>
                    <div className={styles.bottomRight}>
                        <a href="/terms">Terms of Use</a>
                        <a href="/privacy">Privacy Policy</a>
                        {/* <a href="/disclaimer">Disclaimer</a> */}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterTwo;
