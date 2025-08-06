// // pages/debug.js or app/debug/page.js (depending on your Next.js version)
// 'use client';

// import { useEffect, useState } from 'react';

// function getCookie(name) {
//   if (typeof document === 'undefined') return null;
  
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) {
//     try {
//       return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
//     } catch (error) {
//       console.error('Error parsing cookie:', error);
//       return parts.pop().split(';').shift(); // Return raw value if JSON parsing fails
//     }
//   }
//   return null;
// }

// export default function DebugPage() {
//   const [cookies, setCookies] = useState({});
//   const [rawCookies, setRawCookies] = useState('');

//   useEffect(() => {
//     // Get all cookies
//     setRawCookies(document.cookie);
    
//     // Get specific cookies
//     const countryData = getCookie('countryData');
//     const locationData = getCookie('locationData');
    
//     setCookies({
//       countryData,
//       locationData
//     });

//   }, []);

//   const refreshData = () => {
//     window.location.reload();
//   };

//   const clearCookies = () => {
//     document.cookie = 'countryData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//     document.cookie = 'locationData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//     window.location.reload();
//   };

//   return (
//     <div style={{ padding: '20px', fontFamily: 'monospace' ,color:'black'}}>
//       <h1>Cookie Debug Page</h1>
      
//       <div style={{ marginBottom: '20px' }}>
//         <button onClick={refreshData} style={{ marginRight: '10px', padding: '10px' }}>
//           Refresh Data
//         </button>
//         <button onClick={clearCookies} style={{ padding: '10px' }}>
//           Clear Cookies & Refresh
//         </button>
//       </div>

//       <div style={{ marginBottom: '20px' }}>
//         <h2>Raw Cookies:</h2>
//         <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
//           {rawCookies || 'No cookies found'}
//         </pre>
//       </div>

//       <div style={{ marginBottom: '20px' }}>
//         <h2>Country Data:</h2>
//         <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
//           {cookies.countryData ? JSON.stringify(cookies.countryData, null, 2) : 'null'}
//         </pre>
//       </div>

//       <div style={{ marginBottom: '20px' }}>
//         <h2>Location Data:</h2>
//         <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
//           {cookies.locationData ? JSON.stringify(cookies.locationData, null, 2) : 'null'}
//         </pre>
//       </div>

//       <div style={{ marginBottom: '20px',color:'black' }}>
//         <h2>Debug Steps:</h2>
//         <ol>
//           <li>Check the browser console for middleware logs</li>
//           <li>Check the Network tab for API calls</li>
//           <li>Verify middleware.js is in the correct location (root of src/)</li>
//           <li>Check if the APIs are responding correctly</li>
//         </ol>
//       </div>
//     </div>
//   );
// }