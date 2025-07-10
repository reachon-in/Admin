import styles from './NavBar.module.css';
import logo from '../assets/Reachon.png';
import { useState } from 'react';

const NavBar = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img src={logo} alt="Reachon Logo" className={styles.logoImg} />
      </div>
      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="7" stroke="#61788A" strokeWidth="2" />
              <line x1="14.4142" y1="14" x2="18" y2="17.5858" stroke="#61788A" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search post, Tags,Users..."
          />
        </div>
      </div>
      <div className={styles.rightSection}>
        <div className={styles.notificationContainer}>
          <button 
            className={styles.bellBtn} 
            aria-label="Notifications"
            onClick={toggleNotifications}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
          {showNotifications && (
            <div className={styles.notificationPopup}>
              <div className={styles.notificationHeader}>
                <h3>Notifications</h3>
                <button 
                  className={styles.closeBtn}
                  onClick={toggleNotifications}
                >
                  ×
                </button>
              </div>
              <div className={styles.notificationList}>
                <div className={styles.notificationItem}>
                  <p>New message from John Doe</p>
                  <span className={styles.notificationTime}>2 minutes ago</span>
                </div>
                <div className={styles.notificationItem}>
                  <p>Your post got 5 new likes</p>
                  <span className={styles.notificationTime}>15 minutes ago</span>
                </div>
                <div className={styles.notificationItem}>
                  <p>New comment on your post</p>
                  <span className={styles.notificationTime}>1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <img
          className={styles.avatar}
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="User Avatar"
        />
      </div>
    </nav>
  );
};

export default NavBar;
