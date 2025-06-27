import styles from './BlogsSection.module.css';

export default function BlogSection() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.featuredBlog}>
                <div className={styles.image}></div>
                <div className={styles.content}>
                    <h4>Here Goes News title maximum of two lines akjshd skhdf jsh sh hskjhd sdfds fsdfsdfsd kj</h4>
                    <p>Cod Hatch <span>Jun 24 2025</span></p>
                    <a href="#">Read More</a>
                </div>
            </div>
            <div className={styles.blogGrid}>
                {[1, 2, 3, 4].map((i) => (
                    <div className={styles.blogCard} key={i}>
                        <div className={styles.image}></div>
                        <div className={styles.content}>
                            <h5>Blog title maximum of one line...</h5>
                            <p>Cod Hatch <span>Jun 24 2025</span></p>
                            <a href="#">Read More</a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}