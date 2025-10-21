import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './TopNews.module.css';
import { useGlobalData } from '../Context/ApiContext';
import { useDynamicRouter } from '@/hooks/useDynamicRouter';

const NewsList = () => {
  const { news, fetchNewsDetails, language, translateText } = useGlobalData();
  const { pushDynamic } = useDynamicRouter();
  
  const stories = useMemo(() => {
    return news?.storyList?.filter(item => item.story)?.map(item => item.story) || [];
  }, [news]);

  // Initialize with original content for immediate display
  const [displayNews, setDisplayNews] = useState(stories);
  const [translatedHeader, setTranslatedHeader] = useState({
    title: 'Latest News',
    subtitle: 'Stay informed with the latest updates'
  });
  const [isTranslating, setIsTranslating] = useState(false);

  // Create stable reference for stories IDs to prevent unnecessary re-runs
  const storiesKey = useMemo(() => 
    stories.map(s => s.id).join('-'), 
    [stories]
  );

  // Cache key generator
  const getCacheKey = useCallback((type, lang) => 
    `news_${type}_${lang}_v1`, 
    []
  );

  // Load from cache
  const loadFromCache = useCallback((lang) => {
    try {
      const headerCache = localStorage.getItem(getCacheKey('header', lang));
      const storiesCache = localStorage.getItem(getCacheKey('stories', lang));

      if (headerCache) {
        const parsed = JSON.parse(headerCache);
        if (Date.now() - parsed.timestamp < 3600000) { // 1 hour cache
          setTranslatedHeader(parsed.data);
        }
      }

      if (storiesCache) {
        const parsed = JSON.parse(storiesCache);
        if (Date.now() - parsed.timestamp < 3600000) { // 1 hour cache
          const cachedMap = new Map(parsed.data.map(s => [s.id, s]));
          
          const merged = stories.map(story => {
            const cached = cachedMap.get(story.id);
            return cached ? { ...story, ...cached } : story;
          });
          
          setDisplayNews(merged);
          return true;
        }
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return false;
  }, [stories, getCacheKey]);

  // Save to cache
  const saveToCache = useCallback((type, lang, data) => {
    try {
      localStorage.setItem(
        getCacheKey(type, lang),
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }, [getCacheKey]);

  // Optimized translation function
  const translateAllContent = useCallback(async (lang) => {
    if (lang === 'en' || stories.length === 0) {
      setDisplayNews(stories);
      return;
    }

    setIsTranslating(true);

    try {
      // Translate header in parallel (non-blocking)
      const headerPromise = Promise.all([
        translateText('Latest News', 'en', lang),
        translateText('Stay informed with the latest updates', 'en', lang)
      ]).then(([title, subtitle]) => {
        const headerData = { title, subtitle };
        setTranslatedHeader(headerData);
        saveToCache('header', lang, headerData);
      });

      // Batch all story texts for efficient translation
      const textsToTranslate = [];
      const textMap = [];

      stories.forEach((story, idx) => {
        if (story.hline) {
          textsToTranslate.push(story.hline);
          textMap.push({ idx, field: 'headline' });
        }
        if (story.intro) {
          textsToTranslate.push(story.intro);
          textMap.push({ idx, field: 'intro' });
        }
        if (story.coverImage?.caption) {
          textsToTranslate.push(story.coverImage.caption);
          textMap.push({ idx, field: 'caption' });
        }
      });

      // Progressive translation - show results as they come
      if (textsToTranslate.length > 0) {
        // Option 1: If translateText supports batch translation
        // const translations = await translateText(textsToTranslate, 'en', lang);
        
        // Option 2: Translate in chunks for progressive rendering
        const CHUNK_SIZE = 5;
        const translatedResults = [];
        
        for (let i = 0; i < textsToTranslate.length; i += CHUNK_SIZE) {
          const chunk = textsToTranslate.slice(i, i + CHUNK_SIZE);
          const chunkResults = await Promise.all(
            chunk.map(text => translateText(text, 'en', lang))
          );
          translatedResults.push(...chunkResults);

          // Update display progressively
          const currentTranslations = [...translatedResults];
          const updatedStories = stories.map((story, idx) => {
            const result = { ...story };
            textMap.forEach((map, mapIdx) => {
              if (map.idx === idx && currentTranslations[mapIdx]) {
                if (map.field === 'headline') result.translatedHeadline = currentTranslations[mapIdx];
                if (map.field === 'intro') result.translatedIntro = currentTranslations[mapIdx];
                if (map.field === 'caption') result.translatedCaption = currentTranslations[mapIdx];
              }
            });
            return result;
          });

          setDisplayNews(updatedStories);
        }

        // Map translations back to stories
        const finalStories = stories.map((story, idx) => {
          const result = { ...story };
          textMap.forEach((map, mapIdx) => {
            if (map.idx === idx) {
              if (map.field === 'headline') result.translatedHeadline = translatedResults[mapIdx];
              if (map.field === 'intro') result.translatedIntro = translatedResults[mapIdx];
              if (map.field === 'caption') result.translatedCaption = translatedResults[mapIdx];
            }
          });
          return result;
        });

        // Cache the final translations
        const cacheData = finalStories.map(s => ({
          id: s.id,
          translatedHeadline: s.translatedHeadline,
          translatedIntro: s.translatedIntro,
          translatedCaption: s.translatedCaption
        }));
        saveToCache('stories', lang, cacheData);
      }

      await headerPromise;

    } catch (error) {
      console.error('Translation error:', error);
      // Fallback to original content on error
      setDisplayNews(stories);
    } finally {
      setIsTranslating(false);
    }
  }, [stories, translateText, saveToCache]);

  // Main effect with optimized dependencies
  useEffect(() => {
    // Show original content immediately
    setDisplayNews(stories);

    if (language === 'en') {
      setTranslatedHeader({
        title: 'Latest News',
        subtitle: 'Stay informed with the latest updates'
      });
      return;
    }

    // Try loading from cache first
    const cacheLoaded = loadFromCache(language);
    
    // If cache miss or expired, translate
    if (!cacheLoaded) {
      translateAllContent(language);
    }
  }, [language, storiesKey]); // Only depend on language and stories IDs

  // Update display when stories change
  useEffect(() => {
    if (language === 'en' || !stories.length) {
      setDisplayNews(stories);
    }
  }, [stories, language]);

  const openNews = useCallback(async (item) => {
    try {
      await fetchNewsDetails(item.id);
      await pushDynamic(`/news/${item.id}`);
    } catch (error) {
      console.error('Error opening news:', error);
    }
  }, [fetchNewsDetails, pushDynamic]);

  const handleKeyPress = useCallback((e, item) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openNews(item);
    }
  }, [openNews]);

  return (
    <div className={styles.topnewsMain}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{translatedHeader.title}</h2>
          <p>{translatedHeader.subtitle}</p>
        </div>

        {isTranslating && (
          <div className={styles.loadingIndicator}>
            <small>Translating content...</small>
          </div>
        )}

        <div className={styles.newsList}>
          {displayNews.map((item) => (
            <div
              key={item.id}
              className={styles.newsItem}
              onClick={() => openNews(item)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => handleKeyPress(e, item)}
            >
              <div className={styles.newsInfo}>
                <h3 className={styles.newsTitle}>
                  {item.translatedHeadline || item.hline}
                </h3>
                {(item.translatedIntro || item.intro) && (
                  <p className={styles.newsIntro}>
                    {item.translatedIntro || item.intro}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsList;