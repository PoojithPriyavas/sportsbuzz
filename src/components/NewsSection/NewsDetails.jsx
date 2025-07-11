import styles from './NewsDetail.module.css'
import TopNewsSection from '../NewsSection/TopNews';
import MultiBannerSlider from '../Multibanner/MultiBannerSlider';

import PredictionSection from '../Prediction/Prediction';
import AdsSlider from '../AdSlider/AdSlider';
import UpcomingMatches from '../UpComing/UpComingMatches';
import NewsDetailSection from './NewsDetailSection';

export default function NewsDetails() {
    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <NewsDetailSection />
                {/* <BlogSlider /> */}
            </div>
            <div className={styles.right}>
                <AdsSlider />
                <UpcomingMatches />
                <MultiBannerSlider />
            </div>
        </div>
    );
}
