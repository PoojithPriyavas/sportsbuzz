'use client';

import { useState, useEffect } from 'react';
import styles from './RegionSelector.module.css';
import { useGlobalData } from '../Context/ApiContext';
import { useRouter } from 'next/router';

export default function RegionSelector({ countryDataHome, locationDataHome }) {
  const [isVisible, setIsVisible] = useState(true);
  const [filteredHreflangs, setFilteredHreflangs] = useState([]);

  const router = useRouter();

  const {
    setCountryCodeCookie,
    setHreflang,
    setCountry,
    setCountryData,
    setLocationData,
    setLanguage,
  } = useGlobalData();

  // State to hold selected country and hreflang
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedHreflang, setSelectedHreflang] = useState('');
  const [allLocations, setAllLocations] = useState([]);

  // On first load, initialize from props
  useEffect(() => {
    if (countryDataHome && locationDataHome && locationDataHome.length > 0) {
      setAllLocations(locationDataHome);

      const defaultCountry = countryDataHome?.location?.country;
      const defaultHreflang = countryDataHome?.location?.hreflang;

      setSelectedCountry(defaultCountry);
      setSelectedHreflang(defaultHreflang);

      setCountry(defaultCountry);
      setHreflang(defaultHreflang);
      setCountryCodeCookie(countryDataHome.country_code.toLowerCase());
      setCountryData(countryDataHome);
      setLocationData(locationDataHome);

      // Filter initial languages
      const matchingLangs = locationDataHome.filter(
        (loc) => loc.country === defaultCountry
      );
      setFilteredHreflangs(matchingLangs);
    }
  }, [countryDataHome, locationDataHome]);

  // Handle country change
  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    setCountry(newCountry);

    const matchingLangs = allLocations.filter(
      (loc) => loc.country === newCountry
    );

    setFilteredHreflangs(matchingLangs);

    if (matchingLangs.length > 0) {
      setSelectedHreflang(matchingLangs[0].hreflang);
      setHreflang(matchingLangs[0].hreflang);
      setCountryCodeCookie(matchingLangs[0].country_code.toLowerCase());
    }
  };

  // Handle language change
  const handleHreflangChange = (e) => {
    const lang = e.target.value;
    setSelectedHreflang(lang);
    setHreflang(lang);
  };

  const handleContinue = () => {
    setLanguage(selectedHreflang);
    const path = `/${countryDataHome.country_code.toLowerCase()}/${selectedHreflang}`;
    router.push(path);
  };

  if (!isVisible) return null;

  // Get unique countries for dropdown
  const uniqueCountries = [
    ...new Set(allLocations.map((loc) => loc.country)),
  ];

  return (
    <div className={styles.container}>
      <span className={styles.text}>
        Choose another country or region to see content specific to your location.
      </span>

      {/* Country Selector */}
      <select
        value={selectedCountry}
        onChange={handleCountryChange}
        className={styles.select}
      >
        {uniqueCountries.map((ctry, index) => (
          <option key={index} value={ctry}>
            {ctry}
          </option>
        ))}
      </select>

      {/* Language Selector */}
      <select
        value={selectedHreflang}
        onChange={handleHreflangChange}
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
