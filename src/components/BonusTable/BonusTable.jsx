'use client';
import React, { useEffect, useState } from 'react';
import styles from './BonusTable.module.css';
import Head from 'next/head';
import { useGlobalData } from '../Context/ApiContext';

export default function BonusTable({ sections }) {
  console.log(sections,"sec tion")
  const [copiedId, setCopiedId] = useState(null);
  const [translatedSections, setTranslatedSections] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [translatedHeaders, setTranslatedHeaders] = useState({
    rank: 'Rank',
    site: 'Site',
    features: 'Features',
    welcomeBonus: 'Welcome Bonus',
    betNow: 'Bet Now',
    getBonus: 'GET BONUS',
    readReview: 'Read Review',
  });
  const { translateText, language } = useGlobalData();

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Translate table headers when language changes
  useEffect(() => {
    const translateHeaders = async () => {
      try {
        const headers = {
          rank: await translateText('Rank'),
          site: await translateText('Site'),
          features: await translateText('Features'),
          welcomeBonus: await translateText('Welcome Bonus'),
          betNow: await translateText('Bet Now'),
          getBonus: await translateText('GET BONUS'),
          readReview: await translateText('Read Review'),
        };
        setTranslatedHeaders(headers);
      } catch (error) {
        console.error('Header translation error:', error);
      }
    };

    translateHeaders();
  }, [translateText, language]);

  // Translate content when sections or language changes
  useEffect(() => {
    const translateSections = async () => {
      if (!sections || sections.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const updated = await Promise.all(
          sections.map(async (section) => {
            const translatedHeading = await translateText(section.heading);
            const translatedMetaTitle = await translateText(section.metatitle);
            const translatedMetaDesc = await translateText(section.meta_description);

            const translatedApps = await Promise.all(
              (section.best_betting_apps || []).map(async (app) => ({
                ...app,
                features: await translateText(app.features),
                welcome_bonus: await translateText(app.welcome_bonus),
              }))
            );

            return {
              ...section,
              heading: translatedHeading,
              metatitle: translatedMetaTitle,
              meta_description: translatedMetaDesc,
              best_betting_apps: translatedApps,
            };
          })
        );

        setTranslatedSections(updated);
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    translateSections();
  }, [sections, translateText, language]);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Skeleton Loading Components
  const SkeletonDesktopTable = () => (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th>Rank</th>
            <th>Site</th>
            <th>Features</th>
            <th>Welcome Bonus</th>
            <th>Bet Now</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((index) => (
            <tr className={styles.bodyRow} key={index}>
              <td className={styles.rankCell}>
                <div className={`${styles.skeleton} ${styles.skeletonRank}`}></div>
              </td>
              <td className={styles.site}>
                <div className={`${styles.skeleton} ${styles.skeletonLogo}`}></div>
              </td>
              <td className={styles.features}>
                <div className={`${styles.skeleton} ${styles.skeletonText}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonText} ${styles.skeletonTextShort}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonText} ${styles.skeletonTextMedium}`}></div>
              </td>
              <td className={styles.bonus}>
                <div className={`${styles.skeleton} ${styles.skeletonBonus}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonStars}`}></div>
              </td>
              <td className={styles.actions}>
                <div className={`${styles.skeleton} ${styles.skeletonButton} ${styles.skeletonButtonLarge}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const SkeletonMobileCards = () => (
    <div className={styles.mobileContainer}>
      {[1, 2, 3, 4, 5].map((index) => (
        <div className={styles.mobileCard} key={index}>
          <div className={styles.mobileHeader}>
            <div className={`${styles.skeleton} ${styles.skeletonMobileRank}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonMobileLogo}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonMobileStars}`}></div>
          </div>
          
          <div className={styles.mobileContent}>
            <div className={styles.mobileSection}>
              <div className={`${styles.skeleton} ${styles.skeletonMobileTitle}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonMobileText}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonMobileText} ${styles.skeletonTextShort}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonMobileText} ${styles.skeletonTextMedium}`}></div>
            </div>
            
            <div className={styles.mobileSection}>
              <div className={`${styles.skeleton} ${styles.skeletonMobileTitle}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonMobileBonus}`}></div>
            </div>
          </div>
          
          <div className={styles.mobileActions}>
            <div className={`${styles.skeleton} ${styles.skeletonMobileButton} ${styles.skeletonMobileButtonLarge}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonMobileButton}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonMobileButton}`}></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Show skeleton loading
  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        {isMobile ? <SkeletonMobileCards /> : <SkeletonDesktopTable />}
      </div>
    );
  }

  // Show nothing if no translated sections
  if (translatedSections.length === 0) return null;

  // Mobile Card View
  const renderMobileCards = (apps) => (
    <div className={styles.mobileContainer}>
      {[...apps]
        .sort((a, b) => a.order_by - b.order_by)
        .map((app) => (
          <div className={styles.mobileCard} key={app.id}>
            <div className={styles.mobileHeader}>
              <div className={styles.mobileRank}>#{app.order_by}</div>
              <img
                src={`https://admin.sportsbuz.com${app.image}`}
                alt="Betting App"
                className={styles.mobileLogo}
              />
              <div className={styles.mobileStars}>
                {'⭐'.repeat(app.rating)}
              </div>
            </div>
            
            <div className={styles.mobileContent}>
              <div className={styles.mobileSection}>
                <h4>{translatedHeaders.features}:</h4>
                <div dangerouslySetInnerHTML={{ __html: app.features }} />
              </div>
              
              <div className={styles.mobileSection}>
                <h4>{translatedHeaders.welcomeBonus}:</h4>
                <div 
                  className={styles.mobileBonusAmount}
                  dangerouslySetInnerHTML={{ __html: app.welcome_bonus }}
                />
              </div>
            </div>
            
            <div className={styles.mobileActions}>
              <a
                className={styles.mobileGetBtn}
                href={app.referal_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {translatedHeaders.getBonus}
              </a>
              <button
                className={styles.mobileCodeBtn}
                onClick={() => handleCopy(app.referall_code, app.id)}
              >
                {copiedId === app.id ? 'Copied!' : app.referall_code}
              </button>
              <button
                className={styles.mobileReviewBtn}
                onClick={() =>
                  window.open(app.review_link, '_blank', 'noopener,noreferrer')
                }
              >
                {translatedHeaders.readReview}
              </button>
            </div>
          </div>
        ))}
    </div>
  );

  // Desktop Table View
  const renderDesktopTable = (apps) => (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th>{translatedHeaders.rank}</th>
            <th>{translatedHeaders.site}</th>
            <th>{translatedHeaders.features}</th>
            <th>{translatedHeaders.welcomeBonus}</th>
            <th>{translatedHeaders.betNow}</th>
          </tr>
        </thead>
        <tbody>
          {[...apps]
            .sort((a, b) => a.order_by - b.order_by)
            .map((app) => (
              <tr className={styles.bodyRow} key={app.id}>
                <td className={styles.rankCell}>
                  <div className={styles.rankBadge}>#{app.order_by}</div>
                </td>
                <td className={styles.site}>
                  <img
                    src={`https://admin.sportsbuz.com${app.image}`}
                    alt="Betting App"
                  />
                </td>
                <td
                  className={styles.features}
                  dangerouslySetInnerHTML={{ __html: app.features }}
                />
                <td className={styles.bonus}>
                  <div
                    className={styles.amount}
                    dangerouslySetInnerHTML={{ __html: app.welcome_bonus }}
                  />
                  <button
                    className={styles.codeBtn}
                    onClick={() =>
                      window.open(app.review_link, '_blank', 'noopener,noreferrer')
                    }
                  >
                    {translatedHeaders.readReview}
                  </button>
                  <div className={styles.stars}>{'⭐'.repeat(app.rating)}</div>
                </td>
                <td className={styles.actions}>
                  <a
                    className={styles.getBtn}
                    href={app.referal_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {translatedHeaders.getBonus}
                  </a>
                  <button
                    className={styles.codeBtn}
                    onClick={() => handleCopy(app.referall_code, app.id)}
                  >
                    {copiedId === app.id ? 'Copied!' : app.referall_code}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {/* <Head>
        <title>{translatedSections[0]?.metatitle}</title>
        <meta
          name="description"
          content={stripHtml(translatedSections[0]?.meta_description)}
        />
      </Head> */}

      {translatedSections.map((section) => (
        <div className={styles.wrapper} key={section.id}>
          {/* Uncomment to show heading if needed */}
          {/* <h2 className={styles.heading}>{section.heading}</h2> */}

          {section.best_betting_apps?.length > 0 && (
            <>
              {isMobile 
                ? renderMobileCards(section.best_betting_apps)
                : renderDesktopTable(section.best_betting_apps)
              }
            </>
          )}
        </div>
      ))}
    </>
  );
}

// Helper function to strip HTML tags from string for meta description
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}