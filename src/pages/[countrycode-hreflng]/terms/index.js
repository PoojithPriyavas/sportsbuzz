import React from "react";
import { useGlobalData } from "@/components/Context/ApiContext";
import CountryLayout from "@/components/layouts/CountryLayout";
import styles from './terms.module.css';

export default function Terms() {
    const { settings } = useGlobalData();
    // console.log(settings, "settings in the Terms");
    return (
        <>
            <div
                className={styles.termsContainer}
                dangerouslySetInnerHTML={{ __html: settings[0]?.terms_and_conditions}}
            />
        </>
    );
}
Terms.getLayout = function getLayout(page) {
    return <CountryLayout>{page}</CountryLayout>
}
