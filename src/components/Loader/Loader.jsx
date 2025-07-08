'use client';

import { useEffect, useState } from 'react';
import styles from './Loader.module.css';

export default function LoadingScreen({ onFinish }) {
  const [phase, setPhase] = useState('loading');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('logo'), 2000),     
      setTimeout(() => setPhase('shrink'), 2500),  
      setTimeout(() => {
        setPhase('done');
        onFinish();
      }, 3500)                                    
    ];
    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div className={`${styles.loaderWrapper} ${styles[phase]}`}>
      <img src="/sportsbuz.gif" alt="Loading" className={styles.loaderGif} />
      <img src="/sportsbuz.png" alt="Logo" className={styles.logo} />
    </div>
  );
}
