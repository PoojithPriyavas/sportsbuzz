import React from "react";
import HeaderThree from "@/components/Header/HeaderThree";
import FooterTwo from "@/components/Footer/Footer";
import { useGlobalData } from "@/components/Context/ApiContext";

export default function CountryLayout({ children }) {
  const { countryCode } = useGlobalData();

  return (
    <>
      <HeaderThree />
      <main >
        {children}
      </main>
      <FooterTwo countryCode={countryCode} />
    </>
  );
}