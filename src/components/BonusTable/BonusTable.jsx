'use client';
import React, { useEffect, useState } from 'react';
import styles from './BonusTable.module.css';
import Head from 'next/head';
import { useGlobalData } from '../Context/ApiContext';

export default function BonusTable({ sections }) {
  const [copiedId, setCopiedId] = useState(null);
  const [translatedSections, setTranslatedSections] = useState([]);
  const { translateText, language } = useGlobalData();

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
  console.log(translatedSections, "trans")
  if (translatedSections.length === 0) return null;

  return (
    <>
      <Head>
        <title>{translatedSections[0]?.metatitle}</title>
        <meta
          name="description"
          content={stripHtml(translatedSections[0]?.meta_description)}
        />
      </Head>

      {translatedSections.map((section) => (
        <div className={styles.wrapper} key={section.id}>
          {/* Uncomment to show heading if needed */}
          {/* <h2 className={styles.heading}>{section.heading}</h2> */}

          {section.best_betting_apps?.length > 0 && (
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
                {[...section.best_betting_apps] // clone to avoid mutating original
                  .sort((a, b) => a.order_by - b.order_by) // sort by order_by ascending
                  .map((app) => (
                    <tr className={styles.bodyRow} key={app.id}>
                      <td style={{ color: 'black' }}>
                        <strong>#{app.order_by}</strong>
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
