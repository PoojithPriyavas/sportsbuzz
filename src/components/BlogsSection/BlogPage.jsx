import styles from './BlogPage.module.css';
import BlogCard from './BlogCards';
import BlogSearchFilter from './BlogSearchFilter';
import TopNewsSection from '../NewsSection/TopNews';
import MultiBannerSlider from '../Multibanner/MultiBannerSlider';
import BestBettingApps from '../Betting/BestBettingApps';
import PredictionSection from '../Prediction/Prediction';
import GoogleAds from '../googleAds/GoogleAds';

export default function BlogsPage() {
    // Fake blogs data
    const blogs = Array.from({ length: 8 }).map((_, i) => ({
        title: `Blog title maximum of one line...`,
        author: 'Cod Hatch',
        date: 'Jun 24 2025',
        isFeatured: i === 0,
    }));

    return (
        <>
            <div className={styles.container}>
                <div className={styles.left}>
                    <BlogSearchFilter />
                    <div >
                        <BlogCard />
                    </div>
                </div>
                <div className={styles.right}>
                    <PredictionSection />
                    <BestBettingApps />
                    <MultiBannerSlider />
                    <TopNewsSection />
                </div>

            </div>
            <GoogleAds />
        </>

    );
}
