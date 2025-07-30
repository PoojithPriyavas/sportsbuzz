'use client';

import { useGlobalData } from '../Context/ApiContext';
import styles from './NewsDetailSection.module.css';
import Head from 'next/head';

export default function NewsDetailSection() {
    const { selectedNews } = useGlobalData();

    if (!selectedNews?.article) {
        return <p>Loading news...</p>;
    }

    const article = selectedNews.article;
    const meta = selectedNews.layoutContext?.meta || {};
    const mainImage = article?.mainMedia?.[0]?.article?.url;
    const imageAlt = article?.mainMedia?.[0]?.article?.alt || 'News Thumbnail';

    const renderContentBlock = (block) => {
        const type = block?.type;
        const content = block?.data?.content;

        if (!content) return null;

        switch (type) {
            case 'paragraph':
            case 'heading':
                return (
                    <div
                        key={block.id}
                        dangerouslySetInnerHTML={{ __html: content }}
                        className={type === 'heading' ? styles.heading : styles.paragraph}
                    />
                );
            case 'image':
                const img = block.data?.preview?.imageBlock?.image?.urls?.uploaded?.gallery;
                const alt = block.data?.description || 'News Image';
                return (
                    <div key={block.id} className={styles.imageBlock}>
                        <img src={img} alt={alt} />
                        {alt && <p className={styles.imageCaption}>{alt}</p>}
                    </div>
                );
            case 'link':
                return (
                    <div
                        key={block.id}
                        className={styles.linkBlock}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            {/* <Head>
                <title>{meta.title}</title>
                <meta name="description" content={article.description || meta.description} />
                <meta property="og:title" content={meta.title} />
                <meta property="og:description" content={article.description || meta.description} />
                <meta property="og:image" content={mainImage} />
            </Head> */}

            <div className={styles.blogContent}>
                <h1 className={styles.title}>{meta.title}</h1>

                {mainImage && (
                    <div className={styles.thumbnail}>
                        <img
                            src={mainImage}
                            alt={imageAlt}
                            className={styles.thumbnailImg}
                        />
                    </div>
                )}

                <div className={styles.bodyContent}>
                    {article.body?.map((block) => renderContentBlock(block))}
                </div>
            </div>
        </>
    );
}
