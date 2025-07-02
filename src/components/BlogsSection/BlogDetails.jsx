import styles from './BlogDetails.module.css'
import BlogDetailContent from './BlogDetailsContent';
import BlogSlider from './BlogSlider';
import TopNewsSection from '../NewsSection/TopNews';
import MultiBannerSlider from '../Multibanner/MultiBannerSlider';

import PredictionSection from '../Prediction/Prediction';
import AdsSlider from '../AdSlider/AdSlider';
import UpcomingMatches from '../UpComing/UpComingMatches';

export default function BlogDetailsPage() {
    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <BlogDetailContent />
                <BlogSlider />
            </div>
            <div className={styles.right}>
                <AdsSlider />
                <UpcomingMatches />
                <MultiBannerSlider />
            </div>
        </div>
    );
}
