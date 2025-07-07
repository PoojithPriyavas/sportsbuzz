import { useState } from 'react';
import styles from './BlogSearchFilter.module.css';
import { FaSearch } from 'react-icons/fa';

export default function BlogSearchFilter() {
  const [filterValue, setFilterValue] = useState("all")
  return (
    <div className={styles.filterBar}>
      <h2 style={{ color: 'black' }}>Latest Blogs</h2>
      <div className={styles.controls}>
        <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
          <option value='all'>All</option>
          <option value='latest'>Latest</option>
        </select>

        <div className={styles.searchWrapper}>
          <FaSearch className={styles.searchIcon} />
          <input type="text" placeholder="Search Blogs" className={styles.searchInput} />
        </div>
      </div>
    </div>
  );
}
