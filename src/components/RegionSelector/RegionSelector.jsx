// components/RegionSelector.jsx
'use client';

import { useState, useEffect } from 'react';
import styles from './RegionSelector.module.css';
import { useGlobalData } from '../Context/ApiContext';
import Router, { useRouter } from 'next/router';

function getCookie(name) {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    try {
      return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
    } catch (error) {
      console.error('Error parsing cookie:', error);
      return null;
    }
  }
  return null;
}

export default function RegionSelector() {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter()
  // const [country, setCountry] = useState('India');
  // const [countryCodeCookie, setCountryCodeCookie] = useState('in')
  // const [hreflang, setHreflang] = useState('en');
  // const [locationData, setLocationData] = useState(null);
  // const [countryData, setCountryData] = useState(null);

  const {
    countryCodeCookie,
    setCountryCodeCookie,
    hreflang,
    locationData,
    setLocationData,
    countryData,
    setCountryData,
    setHreflang,
    country,
    setCountry
  } = useGlobalData()

  useEffect(() => {
    // Get data from cookies after component mounts
    const locationCookie = getCookie('locationData');
    const countryCookie = getCookie('countryData');
    const hrefLangData= getCookie('lanTagValues');

    setLocationData(locationCookie);
    setCountryData(countryCookie);

    console.log('Location Data:', hrefLangData);
    console.log('Country Data:', countryCookie);

    // Set initial values based on cookie data
    if (locationData?.filtered_locations?.length > 0) {
      const firstLocation = locationData.filtered_locations[0];
      console.log(firstLocation, "first location")
      setCountry(firstLocation.country);
      setHreflang(firstLocation.hreflang);
      setCountryCodeCookie(firstLocation.country_code.toLowerCase());
    }
  }, []);

  const hreflangTags = locationData?.hreflang_tags || [];
  const filteredLocations = locationData?.filtered_locations || [];

  console.log(hreflangTags, "hreflang tags");
  console.log(filteredLocations, "filtered locations");

  const handleContinue = () => {
    // alert(`Country: ${country}\nHreflang: ${hreflang}`);
    // You can redirect, store values, etc. here
      const path = `${countryCodeCookie}/${hreflang}`;
      router.push(path); 
  };

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <span className={styles.text}>
        Choose another country or region to see content specific to your location and shop online.
      </span>

      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className={styles.select}
      >
        {filteredLocations.length > 0 ? (
          filteredLocations.map((location) => (
            <option key={location.id} value={location.country}>
              {location.country}
            </option>
          ))
        ) : (
          <>
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
          </>
        )}
      </select>

      <select
        value={hreflang}
        onChange={(e) => setHreflang(e.target.value)}
        className={styles.select}
      >
        {filteredLocations.length > 0 ? (
          filteredLocations.map((location) => (
            <option key={`${location.id}-${location.hreflang}`} value={location.hreflang}>
              {location.language} ({location.hreflang})
            </option>
          ))
        ) : (
          <>
            <option value="en">English (India)</option>
            <option value="en">English (US)</option>
            <option value="en">English (UK)</option>
            <option value="fr">French (France)</option>
            <option value="de">German (Germany)</option>
            <option value="ja">Japanese (Japan)</option>
          </>
        )}
      </select>

      <button onClick={handleContinue} className={styles.button}>
        Continue
      </button>

      <button onClick={() => setIsVisible(false)} className={styles.closeButton}>
        ×
      </button>
    </div>
  );
}