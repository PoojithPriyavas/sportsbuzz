import { useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { DataProvider } from "@/components/Context/ApiContext";
import RedirectHandler from "@/components/Context/RedirectHandler";
import * as gtag from "@/lib/gtag"; 
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const getLayout = Component.getLayout || ((page) => page);

  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  // Clear language from localStorage on tab/window close or page unload
  useEffect(() => {
    const clearLanguage = () => {
      try {
        localStorage.removeItem('language');
      } catch (_) {}
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', clearLanguage);
      window.addEventListener('beforeunload', clearLanguage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pagehide', clearLanguage);
        window.removeEventListener('beforeunload', clearLanguage);
      }
    };
  }, []);

  return (
    <DataProvider>
      {/* Client-side redirect handler */}
      <RedirectHandler />
      {/* Load GA script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      {getLayout(<Component {...pageProps} />)}
    </DataProvider>
  );
}
