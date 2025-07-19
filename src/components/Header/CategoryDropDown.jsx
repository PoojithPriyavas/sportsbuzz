import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import styles from './CategoryDropDown.module.css'

const CategoryDropdown = ({ translatedCategories}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setExpandedCategories(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setExpandedCategories(new Set());
    }
  };

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSubcategoryClick = (subcategoryId) => {
    window.location.href = `/blogs/pages/all-blogs?subcategory=${subcategoryId}`;
    setIsOpen(false);
    setExpandedCategories(new Set());
  };

  return (
    <div className={styles.categoryDropdownWrapper} ref={dropdownRef}>
      <button 
        className={styles.categoryToggleButton}
        onClick={toggleDropdown}
        type="button"
      >
        Select a Category
        <FaChevronDown className={`${styles.chevronIcon} ${isOpen ? styles.rotated : ''}`} />
      </button>
      
      {isOpen && (
        <div className={styles.categoryDropdownMenu}>
          {translatedCategories.map((category) => (
            <div key={category.id} className={styles.categoryGroup}>
              <div 
                className={styles.categoryItem}
                onClick={() => toggleCategory(category.id)}
              >
                <span className={styles.categoryName}>{category.name}</span>
                {category.subcategories?.length > 0 && (
                  <FaChevronRight 
                    className={`${styles.categoryChevron} ${
                      expandedCategories.has(category.id) ? styles.rotated : ''
                    }`} 
                  />
                )}
              </div>
              
              {expandedCategories.has(category.id) && category.subcategories?.length > 0 && (
                <div className={styles.subcategoryList}>
                  {category.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className={styles.subcategoryItem}
                      onClick={() => handleSubcategoryClick(subcategory.id)}
                    >
                      {subcategory.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;