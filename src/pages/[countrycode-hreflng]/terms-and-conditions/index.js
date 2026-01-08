import React from "react";
import { useGlobalData } from "@/components/Context/ApiContext";
import CountryLayout from "@/components/layouts/CountryLayout";
import styles from './terms.module.css';

export default function Terms() {
    const { settings } = useGlobalData();
    
    // Handle loading and null states
    if (!settings || settings.length === 0) {
        return (
            <div className={styles.termsContainer}>
                <p>Loading terms and conditions...</p>
            </div>
        );
    }

    const termsContent = settings[0]?.terms_and_conditions;

    if (!termsContent) {
        return (
            <div className={styles.termsContainer}>
                <p>Terms and conditions not available.</p>
            </div>
        );
    }

    return (
        <div
            className={styles.termsContainer}
            dangerouslySetInnerHTML={{ __html: termsContent }}
        />
    );
}

Terms.getLayout = function getLayout(page) {
    return <CountryLayout>{page}</CountryLayout>
}