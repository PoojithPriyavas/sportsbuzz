// // components/hoc/withLanguageValidation.js
// import React from 'react';
// import { useLanguageValidation } from '@/hooks/useLanguageValidation';

// const withLanguageValidation = (WrappedComponent) => {
//     const WithLanguageValidationComponent = (props) => {
//         const { locationDataHome, resolvedUrl } = props;
        
//         // Use the custom hook
//         const languageValidation = useLanguageValidation(locationDataHome, resolvedUrl);

//         // Optional: Add development testing UI
//         const DevTestingUI = () => {
//             if (process.env.NODE_ENV !== 'development') return null;

//             return (
//                 <div style={{
//                     position: 'fixed',
//                     bottom: '20px',
//                     right: '20px',
//                     backgroundColor: '#f0f0f0',
//                     padding: '15px',
//                     borderRadius: '8px',
//                     border: '1px solid #ccc',
//                     minWidth: '250px',
//                     zIndex: 9999,
//                     fontSize: '12px'
//                 }}>
//                     <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
//                         Language Validation Test
//                     </div>
//                     <div style={{ marginBottom: '10px' }}>
//                         Current: {languageValidation.countryPart?.toUpperCase()}-{languageValidation.langPart?.toUpperCase()}
//                     </div>
                    
//                     <div style={{ marginBottom: '10px' }}>
//                         <label style={{ display: 'block', marginBottom: '5px' }}>Country: </label>
//                         <select 
//                             value={languageValidation.countryPart || ''} 
//                             onChange={(e) => languageValidation.handleCountryChange(e.target.value)}
//                             style={{ width: '100%', padding: '5px' }}
//                         >
//                             <option value="">Select Country</option>
//                             {languageValidation.getAllAvailableCountries.map((country, index) => (
//                                 <option key={index} value={country.country_code}>
//                                     {country.country} ({country.country_code.toUpperCase()})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div>
//                         <label style={{ display: 'block', marginBottom: '5px' }}>Language: </label>
//                         <select 
//                             value={languageValidation.langPart || ''} 
//                             onChange={(e) => languageValidation.handleLanguageChange(e.target.value)}
//                             style={{ width: '100%', padding: '5px' }}
//                         >
//                             <option value="">Select Language</option>
//                             {languageValidation.getSupportedLanguagesForCountry.map((lang, index) => (
//                                 <option key={index} value={lang.hreflang}>
//                                     {lang.language} ({lang.hreflang})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
//             );
//         };

//         return (
//             <>
//                 <WrappedComponent {...props} languageValidation={languageValidation} />
//                 <DevTestingUI />
//             </>
//         );
//     };

//     WithLanguageValidationComponent.displayName = `withLanguageValidation(${WrappedComponent.displayName || WrappedComponent.name})`;

//     return WithLanguageValidationComponent;
// };

// export default withLanguageValidation;