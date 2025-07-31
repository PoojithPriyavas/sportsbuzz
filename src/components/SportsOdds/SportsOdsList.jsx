import React from 'react';
import SportsOdsCard from './SportsOdsCards';
import styles from './SportsOdsLIst.module.css';

const SportsOddsList = () => {
  return (
    <div className={styles.container}>
      <div className={styles.cardsWrapper}>
        {/* {matches.map((match, index) => ( */}
        <SportsOdsCard />
        {/* ))} */}
      </div>
    </div>
  );
};

export default SportsOddsList;
