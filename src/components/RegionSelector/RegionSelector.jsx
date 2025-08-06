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
  const [allLocations, setAllLocations] = useState([]); // from lanTagValues cookie
  const [filteredHreflangs, setFilteredHreflangs] = useState([]);

  const router = useRouter();

  const {
    countryCodeCookie,
    setCountryCodeCookie,
    hreflang,
    setHreflang,
    country,
    setCountry,
    setCountryData,
    setLocationData,
    setLanguage
  } = useGlobalData();

  useEffect(() => {
    const locationCookie = getCookie('locationData');
    const countryCookie = getCookie('countryData');
    const hrefLangData = getCookie('lanTagValues'); // full list

    setLocationData(locationCookie);
    setCountryData(countryCookie);
    setAllLocations(hrefLangData || []);

    if (locationCookie?.filtered_locations?.length > 0) {
      const firstLocation = locationCookie.filtered_locations[0];
      setCountry(firstLocation.country);
      setHreflang(firstLocation.hreflang);
      setCountryCodeCookie(firstLocation.country_code.toLowerCase());

      // Initial hreflangs for selected country
      const initialHrefs = hrefLangData?.filter(
        loc => loc.country === firstLocation.country
      );
      setFilteredHreflangs(initialHrefs);
    }
  }, []);

  // Update hreflangs based on selected country
  useEffect(() => {
    if (country && allLocations.length > 0) {
      const matchingLangs = allLocations.filter(loc => loc.country === country);
      setFilteredHreflangs(matchingLangs);

      if (matchingLangs.length > 0) {
        setHreflang(matchingLangs[0].hreflang);
        setCountryCodeCookie(matchingLangs[0].country_code.toLowerCase());
      }
    }
  }, [country]);

  const handleContinue = () => {
    setLanguage(hreflang);
    const path = `${countryCodeCookie}/${hreflang}`;
    router.push(path);
  };

  if (!isVisible) return null;

  // Get unique country names from allLocations
  const uniqueCountries = [...new Set(allLocations.map(loc => loc.country))];

  return (
    <div className={styles.container}>
      <span className={styles.text}>
        Choose another country or region to see content specific to your location.
      </span>

      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className={styles.select}
      >
        {uniqueCountries.map((ctry, index) => (
          <option key={index} value={ctry}>
            {ctry}
          </option>
        ))}
      </select>

      <select
        value={hreflang}
        onChange={(e) => setHreflang(e.target.value)}
        className={styles.select}
      >
        {filteredHreflangs.length > 0 ? (
          filteredHreflangs.map((loc) => (
            <option key={`${loc.id}-${loc.hreflang}`} value={loc.hreflang}>
              {loc.language} ({loc.hreflang})
            </option>
          ))
        ) : (
          <option>No languages available</option>
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
