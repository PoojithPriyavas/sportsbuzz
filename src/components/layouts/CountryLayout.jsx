import React, { useState, useEffect } from "react";
import HeaderThree from "@/components/Header/HeaderThree";
import FooterTwo from "@/components/Footer/Footer";
import { useGlobalData } from "@/components/Context/ApiContext";

export default function CountryLayout({ children }) {
  const { countryCode, setShowOtherDivs, showOtherDivs } = useGlobalData();

  const [loading, setLoading] = useState(true);
  const [animationStage, setAnimationStage] = useState('loading');

  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);


  useEffect(() => {
    // Check if animation has been played before
    const hasPlayedAnimation = localStorage.getItem('headerAnimationPlayed');

    if (!hasPlayedAnimation) {
      // First time - play the full animation sequence
      const timer1 = setTimeout(() => setAnimationStage('logoReveal'), 2000);
      const timer2 = setTimeout(() => setAnimationStage('transition'), 3500);
      const timer3 = setTimeout(() => setAnimationStage('header'), 5000);
      const timer4 = setTimeout(() => setShowOtherDivs(true), 6500); // Show content after transition completes

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    } else {
      // Animation already played - go directly to header and show content immediately
      setAnimationStage('header');
      setShowOtherDivs(true);
      setLoading(false);
      console.log('enters the header else condition');
      console.log(animationStage, "animationStage value");

    }
  }, []);
  console.log(animationStage, "animationStage value outer else");

  // Original loading timer (keeping for compatibility)
  useEffect(() => {
    const timer1 = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (showOtherDivs) {
      const timeout = setTimeout(() => setHasAnimatedIn(true), 50); // slight delay triggers transition
      return () => clearTimeout(timeout);
    }
  }, [showOtherDivs]);


  return (
    <>
      <HeaderThree />
      <main >
        {children}
      </main>
      {showOtherDivs &&
        <FooterTwo countryCode={countryCode} />
      }
    </>
  );
}