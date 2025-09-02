import styles from './BlogDetails.module.css'
import { useState, useEffect } from 'react';
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
import AutoSliderEven from '../AutoSlider/AutoSliderEven';
import AutoSlider from '../AutoSlider/AutoSlider';
import SportsOddsList from '../SportsOdds/SportsOdsList';



export default function BlogDetailsPage({ blog }) {

    return (
        <div >

            <div className={styles.fourColumnRow}>
                <div className={styles.leftThreeColumns}>
                    <BlogDetailContent blog={blog} />
                    {/* <BlogSlider /> */}
                </div>
                <div className={styles.fourthColumn}>
                    <div className={styles.fourthColumnTwoColumns}>
                        <div className={styles.fourthColumnLeft}>
                            <JoinTelegramButton />
                            <div className={styles.bettingCardWrapper}>
                                <BettingCard />
                                <div style={{ margin: '10px 0' }}>
                                    <AutoSliderEven />
                                </div>

                            </div>
                            <JoinTelegramButton />
                            <UpcomingFootballMatches />
                        </div>
                        <div className={styles.fourthColumnRight}>
                            <AutoSlider />

                        </div>

                        <SportsOddsList />

                    </div>

                </div>
            </div>
        </div>
    );
}
