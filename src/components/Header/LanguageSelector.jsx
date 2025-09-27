import React from 'react';
import { getAllAvailableLanguages } from '@/utils/countryLanguageUtils';

const LanguageSelector = ({ 
  locationsData, 
  currentLanguage, 
  onLanguageChange,
  expanded,
  onToggle
}) => {
  const languages = getAllAvailableLanguages(locationsData);
  
  return (
    <div className="language-selector">
      <button 
        className="language-selector-button"
        onClick={onToggle}
      >
        {currentLanguage.toUpperCase()}
      </button>
      
      {expanded && (
        <div className="language-dropdown">
          {languages.map((lang, index) => (
            <button
              key={index}
              className={`language-option ${lang.hreflang === currentLanguage ? 'active' : ''}`}
              onClick={() => {
                onLanguageChange(lang.hreflang);
                onToggle();
              }}
            >
              {lang.language}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;