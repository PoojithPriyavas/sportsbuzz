import styles from './TopNews.module.css';

export default function TopNewsSection() {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h4>Top News</h4>
                <a href="#">view all</a>
            </div>
            <ol>
                <li>India make the most of Australia’s sweep stumble</li>
                <li>Such is the tension of South Africa’s charge at Lord’s that..</li>
                <li>The South African captain battled through cramps to help..</li>
            </ol>
            <p className={styles.meta}>Cod Hatch, 11 min ago</p>
        </div>
    );
}