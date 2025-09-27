import React from 'react';
import { getAllAvailableCountries } from '@/utils/countryLanguageUtils';

const CountrySelector = ({ 
  locationsData, 
  currentCountryCode, 
  onCountryChange,
  expanded,
  onToggle
}) => {
  const countries = getAllAvailableCountries(locationsData);
  
  return (
    <div className="country-selector">
      <button 
        className="country-selector-button"
        onClick={onToggle}
      >
        {currentCountryCode}
      </button>
      
      {expanded && (
        <div className="country-dropdown">
          {countries.map((country, index) => (
            <button
              key={index}
              className={`country-option ${country.country_code === currentCountryCode ? 'active' : ''}`}
              onClick={() => {
                onCountryChange(country.country_code);
                onToggle();
              }}
            >
              {country.country}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelector;