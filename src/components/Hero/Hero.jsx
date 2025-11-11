import React, { useState, useEffect, useRef } from 'react';
import styles from './Hero.module.css';
import { useGlobalData } from '../Context/ApiContext';
import heroTranslations from './heroTranslations.json';

const HeroSection = () => {
    const { language, debugTranslateText } = useGlobalData();
    const previousLanguage = useRef(null);

    const [translatedText, setTranslatedText] = useState({
        title: 'CONTACT US',
        subtitle: "Get in touch with our team. We're here to help you with any questions, feedback, or partnership opportunities you may have."
    });

    // Helper function to get translation from JSON or API
    const getTranslation = async (text, targetLanguage) => {
        const languageData = heroTranslations.find(
            item => item.hreflang === targetLanguage
        );

        if (languageData && languageData.translatedText) {
            const keyMapping = {
                'CONTACT US': 'title',
                "Get in touch with our team. We're here to help you with any questions, feedback, or partnership opportunities you may have.": 'subtitle'
            };

            const jsonKey = keyMapping[text];
            if (jsonKey && languageData.translatedText[jsonKey]) {
                return languageData.translatedText[jsonKey];
            }
        }

        return await debugTranslateText(text, 'en', targetLanguage);
    };

    // Translate labels when language changes
    useEffect(() => {
        const translateLabels = async () => {
            if (previousLanguage.current === language) return;
            previousLanguage.current = language;

            try {
                // Get language data from JSON
                const languageData = heroTranslations.find(
                    item => item.hreflang === language
                );

                if (languageData && languageData.translatedText) {
                    // Use translations from JSON file directly
                    setTranslatedText({
                        title: languageData.translatedText.title,
                        subtitle: languageData.translatedText.subtitle
                    });
                } else {
                    // Fallback to API translation if JSON not found
                    const [title, subtitle] = await Promise.all([
                        getTranslation('CONTACT US', language),
                        getTranslation("Get in touch with our team. We're here to help you with any questions, feedback, or partnership opportunities you may have.", language)
                    ]);

                    setTranslatedText({
                        title,
                        subtitle
                    });
                }
            } catch (error) {
                console.error('Translation error:', error);
            }
        };

        translateLabels();
    }, [language, debugTranslateText]);

    return (
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>{translatedText.title}</h1>
                <p className={styles.heroSubtitle}>
                    {translatedText.subtitle}
                </p>
            </div>
            <div className={styles.heroImageContainer}>
                <img
                    src="/contact.png"
                    alt="Hero visual"
                    className={styles.heroImage}
                />
            </div>
        </section>
    );
};

export default HeroSection;