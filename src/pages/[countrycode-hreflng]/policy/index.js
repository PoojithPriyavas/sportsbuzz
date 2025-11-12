import React from "react";
import { useGlobalData } from "@/components/Context/ApiContext";
import CountryLayout from "@/components/layouts/CountryLayout";
import styles from './policy.module.css';

export default function Policy() {
    const { settings } = useGlobalData();
    // console.log(settings, "settings in the policy");
    return (
        <>
            <div
                className={styles.policyContainer}
                dangerouslySetInnerHTML={{ __html: settings[0]?.privacy_policy }}
            />
        </>
    );
}
Policy.getLayout = function getLayout(page) {
    return <CountryLayout>{page}</CountryLayout>
}
