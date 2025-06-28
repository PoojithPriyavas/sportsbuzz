import styles from './BlogDetailContent.module.css';

export default function BlogDetailContent() {
  return (
    <div className={styles.blogContent}>
      <h1 className={styles.title}>BLOG SECTION HEADING GOES HERE  MAXIMUM ANY NUMBER OF LINES IS SUPPORTED</h1>
      <div className={styles.thumbnail}></div>
      <p className={styles.description}>
        Blog Content Goes Here - Comes From Text Editor Through Admin Panel. So Overall Pattern Will Be Design In The Admin Panel Itself. A Maximum Of Two Images Can Be Added In The Blog Section - One Is Thumbnail And The Other Is Features Graphics.
      </p>
      <p className={styles.description}>
        Blog Content Goes Here - Comes From Text Editor Through Admin Panel. So Overall Pattern Will Be Design In The Admin Panel Itself. A Maximum Of Two Images Can Be Added In The Blog Section - One Is Thumbnail And The Other Is Features Graphics.
      </p>
    </div>
  );
}
