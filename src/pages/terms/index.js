export default function Terms() {
    return (
        <>
            <div
                // ref={containerRef}
                className={`${styles.loadingContainerOut}`}>
                <div
                    // ref={loadingAnimationRef}
                    className={`${styles.loadingAnimationOut} `}
                >
                    <div className={styles.loadingIconOut}>
                        <div className={styles.mainIconOut}>
                            <img src="/sportsbuz.gif" alt="Loading" className={styles.iconInnerOut} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}