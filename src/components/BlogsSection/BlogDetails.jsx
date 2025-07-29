import styles from './BlogDetails.module.css'
import BlogDetailContent from './BlogDetailsContent';
import BlogSlider from './BlogSlider';
import TopNewsSection from '../NewsSection/TopNews';
import MultiBannerSlider from '../Multibanner/MultiBannerSlider';

import PredictionSection from '../Prediction/Prediction';
import AdsSlider from '../AdSlider/AdSlider';
import UpcomingMatches from '../UpComing/UpComingMatches';
import BettingCard from '../OddsMultiply/BettingCard';
import UpcomingFootballMatches from '../UpComing/UpComingFootball';
import JoinTelegramButton from '../JoinTelegram/JoinTelegramButton';



export default function BlogDetailsPage({ blog }) {
    return (
        <div className={styles.container}>
            <div className={styles.left}>

                <BlogDetailContent blog={blog} />

                <BlogSlider />
            </div>
            <div className={styles.right}>
                <JoinTelegramButton />
                <BettingCard />
                <UpcomingFootballMatches />

            </div>
        </div>
    );
}
