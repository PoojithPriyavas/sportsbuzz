import { DataProvider } from "@/components/Context/ApiContext";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <DataProvider >
      <Component {...pageProps} />
    </DataProvider>
  );
}
