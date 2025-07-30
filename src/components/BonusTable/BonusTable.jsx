'use client';
import React, { useEffect, useState } from 'react';
import styles from './BonusTable.module.css';
import Head from 'next/head';
import { useGlobalData } from '../Context/ApiContext';

export default function BonusTable({ sections }) {
  const [copiedId, setCopiedId] = useState(null);
  const [translatedSections, setTranslatedSections] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
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

  // Translate content when sections or language changes
  useEffect(() => {
    const translateSections = async () => {
      if (!sections || sections.length === 0) return;

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
    };

    translateSections();
  }, [sections, translateText, language]);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

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
                <h4>Features:</h4>
                <div dangerouslySetInnerHTML={{ __html: app.features }} />
              </div>
              
              <div className={styles.mobileSection}>
                <h4>Welcome Bonus:</h4>
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
                GET BONUS
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
                Read Review
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
            <th>Rank</th>
            <th>Site</th>
            <th>Features</th>
            <th>Welcome Bonus</th>
            <th>Bet Now</th>
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
                    Read Review
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
                    GET BONUS
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