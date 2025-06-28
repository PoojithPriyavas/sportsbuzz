import styles from './BlogSearchFilter.module.css';

export default function BlogSearchFilter() {
  return (
    <div className={styles.filterBar}>
      <h2 style={{color:'black'}}>Latest Blogs</h2>
      <div className={styles.controls}>
        <select>
          <option>All</option>
          <option>Latest</option>
        </select>
        <input type="text" placeholder="Search Blogs" />
      </div>
    </div>
  );
}
