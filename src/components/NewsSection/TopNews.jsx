import React, { useState } from 'react';
import styles from './TopNews.module.css';

const newsItems = [
    {
        id: 1,
        title: 'Breaking: Revolutionary AI Technology Transforms Healthcare Industry',
        date: '📅 2 hours ago',
        category: 'Technology',
    },
    {
        id: 2,
        title: 'Global Climate Summit Reaches Historic Agreement on Carbon Emissions',
        date: '📅 4 hours ago',
        category: 'Environment',
    },
    {
        id: 3,
        title: "Stock Market Surges Following Federal Reserve's Economic Policy Update",
        date: '📅 6 hours ago',
        category: 'Finance',
        bookmarked: true,
    },
    {
        id: 4,
        title: 'Olympic Games 2024: Spectacular Opening Ceremony Kicks Off Competition',
        date: '📅 8 hours ago',
        category: 'Sports',
    },
    {
        id: 5,
        title: 'Space Exploration Milestone: First Human Mission to Mars Approved',
        summary: 'NASA announces approval for the first crewed mission to Mars, scheduled for 2030...',
        date: '📅 12 hours ago',
        source: '🏢 Space News Network',
        category: 'Science',
    },
    {
        id: 6,
        title: 'Breakthrough in Renewable Energy: Solar Panel Efficiency Reaches 40%',
        summary: 'Researchers have developed next-gen solar panels achieving 40% efficiency...',
        date: '📅 1 day ago',
        source: '🏢 Energy Today',
        category: 'Energy',
    },
];

const NewsList = () => {
    const [bookmarks, setBookmarks] = useState({});

    const toggleBookmark = (id) => {
        setBookmarks((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const shareNews = (id) => {
        console.log('Sharing article:', id);
    };

    const openNews = (id) => {
        console.log('Opening article:', id);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Latest News</h2>
                <p>Stay informed with the latest updates</p>
            </div>

            <div className={styles.newsList}>
                {newsItems.map((item) => (
                    <div key={item.id} className={styles.newsItem} onClick={() => openNews(item.id)}>
                        {/* 1. Thumbnail / logo */}
                        <div className={styles.thumbnail}></div>
                        {/* 2. Title + date/time column */}
                        <div className={styles.newsInfo}>
                            <h3 className={styles.newsTitle}>{item.title}</h3>
                            <div className={styles.newsMeta}>
                                <span className={styles.newsDate}>{item.date}</span>
                            </div>
                        </div>
                    </div>

                ))}
            </div>
        </div>
    );
};

export default NewsList;
