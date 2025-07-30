import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Added missing import
import styles from './NewsSetion.module.css'
import { useRouter } from 'next/router';

const NewsSectionCards = () => {
    const router = useRouter();
    const { id } = router.query;

    const [matchData, setMatchData] = useState(null); // Changed from [] to null
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNewsDetails = async (id) => {
        console.log(id, "click id")
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `https://cricbuzz-cricket.p.rapidapi.com/news/v1/detail/${id}`,
                {
                    headers: {
                        'X-RapidAPI-Key': 'efe47ba8d5mshfaf50a473c8685ep180cbcjsn11186002a7ec',
                    },
                }
            );
            setMatchData(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching news details:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchNewsDetails(id);
        }
    }, [id]);

    // Parse the content array to extract text content
    const getTextContent = (content) => {
        if (!content || !Array.isArray(content)) return []; // Added safety check
        return content
            .filter(item => item.content && item.content.contentType === 'text')
            .map(item => item.content.contentValue);
    };

    // Format the publish time
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        return new Date(parseInt(timestamp)).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Parse brief scores from the formatted content
    const parseBriefScores = (content, format) => {
        if (!content || !Array.isArray(content)) return null; // Added safety check
        
        const scoreContent = content.find(item =>
            item.content && item.content.hasFormat && item.content.contentValue.includes('@B0$')
        );

        if (scoreContent && format && format[0]) {
            let text = scoreContent.content.contentValue;
            format[0].value.forEach(formatItem => {
                text = text.replace(formatItem.id, `**${formatItem.value}**`);
            });
            return text;
        }
        return null;
    };

    // Get tag class based on type
    const getTagClass = (itemType) => {
        switch (itemType) {
            case 'team':
                return `${styles.tag} ${styles.tagTeam}`;
            case 'series':
                return `${styles.tag} ${styles.tagSeries}`;
            default:
                return `${styles.tag} ${styles.tagMatch}`;
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading news details...</div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Error loading news: {error}</div>
            </div>
        );
    }

    // Show empty state if no data
    if (!matchData) {
        return (
            <div className={styles.container}>
                <div className={styles.noData}>No news data available</div>
            </div>
        );
    }

    const textContent = getTextContent(matchData.content);
    const briefScores = parseBriefScores(matchData.content, matchData.format);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.headline}>{matchData.headline || 'No headline available'}</h1>
                        <p className={styles.context}>{matchData.context || ''}</p>
                        <p className={styles.intro}>{matchData.intro || ''}</p>
                    </div>
                    <div className={styles.headerRight}>
                        <p className={styles.publishLabel}>Published</p>
                        <p className={styles.publishDate}>{formatDate(matchData.publishTime)}</p>
                    </div>
                </div>
            </div>

            {/* Cover Image */}
            {/* {matchData.coverImage && (
                <div className={styles.coverImage}>
                    <div className={styles.imagePlaceholder}>
                        <div className={styles.imagePlaceholderContent}>
                            <div className={styles.imageIcon}>📸</div>
                            <p className={styles.imageId}>Image ID: {matchData.coverImage.id}</p>
                            <p className={styles.imageCaption}>{matchData.coverImage.caption}</p>
                            <p className={styles.imageSource}>Source: {matchData.coverImage.source}</p>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Brief Scores */}
            {briefScores && (
                <div className={styles.briefScores}>
                    <h3 className={styles.briefScoresTitle}>Match Result</h3>
                    <div className={styles.briefScoresContent}>
                        {briefScores.split('**').map((part, index) =>
                            index % 2 === 1 ? (
                                <span key={index} className={styles.briefScoresBold}>{part}</span>
                            ) : (
                                <span key={index}>{part}</span>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={styles.content}>
                <div className={styles.prose}>
                    {textContent.length > 0 ? (
                        textContent.map((paragraph, index) => (
                            <p key={index} className={styles.paragraph}>
                                {paragraph}
                            </p>
                        ))
                    ) : (
                        <p className={styles.noContent}>No content available</p>
                    )}
                </div>
            </div>

            {/* Tags */}
            {matchData.tags && matchData.tags.length > 0 && (
                <div className={styles.tagsSection}>
                    <h4 className={styles.tagsTitle}>Tags</h4>
                    <div className={styles.tagsContainer}>
                        {matchData.tags.map((tag, index) => (
                            <span key={index} className={getTagClass(tag.itemType)}>
                                {tag.itemName}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            {matchData.authors && matchData.authors.length > 0 && (
                <div className={styles.footer}>
                    <div className={styles.footerContent}>
                        <div className={styles.footerLeft}>
                            <span>By: {matchData.authors[0].name}</span>
                            <span className={styles.footerSeparator}>•</span>
                            <span>Source: {matchData.source || 'Unknown'}</span>
                            <span className={styles.footerSeparator}>•</span>
                            <span>Type: {matchData.storyType || 'Unknown'}</span>
                        </div>
                        <span>ID: {matchData.id}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsSectionCards;