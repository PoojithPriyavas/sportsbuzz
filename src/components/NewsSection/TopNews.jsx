import React, { useState, useEffect, useMemo } from 'react';
import styles from './TopNews.module.css';
import { useGlobalData } from '../Context/ApiContext';
import { useDynamicRouter } from '@/hooks/useDynamicRouter';
import { useRouter } from 'next/router';

const NewsList = () => {
  const { news, fetchNewsDetails, language, translateText } = useGlobalData();
  const { pushDynamic } = useDynamicRouter();
  const stories = useMemo(() => {
    return news?.storyList?.filter(item => item.story)?.map(item => item.story) || [];
  }, [news]);

  const [translatedNews, setTranslatedNews] = useState([]);
  const [translatedHeader, setTranslatedHeader] = useState({
    title: 'Latest News',
    subtitle: 'Stay informed with the latest updates'
  });

  useEffect(() => {
    const translateContent = async () => {
      try {
        // Translate header content individually
        const headerTranslations = {
          title: await translateText('Latest News', 'en', language),
          subtitle: await translateText('Stay informed with the latest updates', 'en', language)
        };

        setTranslatedHeader(headerTranslations);

        // Cache header translations
        localStorage.setItem('newsHeaderTranslations', JSON.stringify({
          language,
          translations: headerTranslations
        }));

        // Translate each story individually
        const translatedStories = await Promise.all(stories.map(async (item) => {
          const translatedItem = {
            ...item,
            translatedHeadline: await translateText(item.hline, 'en', language),
            translatedIntro: item.intro ? await translateText(item.intro, 'en', language) : '',
            translatedCaption: item.coverImage?.caption ? 
              await translateText(item.coverImage.caption, 'en', language) : ''
          };
          return translatedItem;
        }));

        setTranslatedNews(translatedStories);

        // Cache story translations
        localStorage.setItem('newsStoriesTranslations', JSON.stringify({
          language,
          stories: translatedStories.map(story => ({
            id: story.id,
            translatedHeadline: story.translatedHeadline,
            translatedIntro: story.translatedIntro,
            translatedCaption: story.translatedCaption
          }))
        }));

      } catch (error) {
        console.error('Error translating news content:', error);
      }
    };

    // Check for cached header translations
    const cachedHeaderTranslations = localStorage.getItem('newsHeaderTranslations');
    const cachedStoriesTranslations = localStorage.getItem('newsStoriesTranslations');

    if (cachedHeaderTranslations && cachedStoriesTranslations) {
      try {
        const parsedHeader = JSON.parse(cachedHeaderTranslations);
        const parsedStories = JSON.parse(cachedStoriesTranslations);

        if (parsedHeader.language === language) {
          setTranslatedHeader(parsedHeader.translations);
        }

        if (parsedStories.language === language) {
          // Match cached translations with current stories
          const updatedStories = stories.map(story => {
            const cachedStory = parsedStories.stories.find(s => s.id === story.id);
            if (cachedStory) {
              return {
                ...story,
                translatedHeadline: cachedStory.translatedHeadline,
                translatedIntro: cachedStory.translatedIntro,
                translatedCaption: cachedStory.translatedCaption
              };
            }
            return story;
          });
          setTranslatedNews(updatedStories);
        } else {
          translateContent();
        }
      } catch (error) {
        console.error('Error parsing cached translations:', error);
        translateContent();
      }
    } else {
      translateContent();
    }
  }, [language, stories, translateText]);

  const openNews = async (item) => {
    await fetchNewsDetails(item.id);
    const slug = item.hline.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await pushDynamic(`/news/${item.id}`);
  };

  return (
    <div className={styles.topnewsMain}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{translatedHeader.title}</h2>
          <p>{translatedHeader.subtitle}</p>
        </div>

        <div className={styles.newsList}>
          {translatedNews.map((item) => (
            <div
              key={item.id}
              className={styles.newsItem}
              onClick={() => openNews(item)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && openNews(item)}
            >
              {/* <div className={styles.thumbnail}>
                {item.coverImage?.url && (
                  <img
                    src={item.coverImage.url}
                    alt={item.translatedCaption || item.translatedHeadline}
                    loading="lazy"
                  />
                )}
              </div> */}
              <div className={styles.newsInfo}>
                <h3 className={styles.newsTitle}>{item.translatedHeadline}</h3>
                {item.translatedIntro && (
                  <p className={styles.newsIntro}>{item.translatedIntro}</p>
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