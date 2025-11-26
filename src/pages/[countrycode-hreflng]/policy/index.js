import React from "react";
import { useGlobalData } from "@/components/Context/ApiContext";
import CountryLayout from "@/components/layouts/CountryLayout";
import styles from './policy.module.css';

export default function Policy() {
    const { settings } = useGlobalData();
    
    // Handle loading and null states
    if (!settings || settings.length === 0) {
        return (
            <div className={styles.policyContainer}>
                <p>Loading terms and conditions...</p>
            </div>
        );
    }

    const termsContent = settings[0]?.privacy_policy;

    if (!termsContent) {
        return (
            <div className={styles.policyContainer}>
                <p>Terms and conditions not available.</p>
            </div>
        );
    }

    return (
        <div
            className={styles.policyContainer}
            dangerouslySetInnerHTML={{ __html: termsContent }}
        />
    );
}

Policy.getLayout = function getLayout(page) {
    return <CountryLayout>{page}</CountryLayout>
}