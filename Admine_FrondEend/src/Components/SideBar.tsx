import { useState } from "react";
import styles from "./SideBar.module.css";
import { useNavigate } from "react-router-dom";

const icons = [
  // Dashboard (grid)
  <svg width="32" height="31" viewBox="0 0 32 32" fill="none" key="dashboard">
    <rect x="6" y="6" width="6" height="6" rx="1" fill="#fff" />
    <rect x="20" y="6" width="6" height="6" rx="1" fill="#fff" />
    <rect x="6" y="20" width="6" height="6" rx="1" fill="#fff" />
    <rect x="20" y="20" width="6" height="6" rx="1" fill="#fff" />
  </svg>,
  // Document
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" key="doc">
    <rect x="10" y="6" width="12" height="20" rx="2" fill="#fff" />
    <rect x="14" y="10" width="4" height="2" rx="1" fill="#000" />
    <rect x="14" y="14" width="4" height="2" rx="1" fill="#000" />
  </svg>,
  // Click/target
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" key="target">
    <circle cx="16" cy="16" r="10" stroke="#fff" strokeWidth="2" />
    <path
      d="M16 11v5l3 3"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>,
  // Shield
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" key="shield">
    <path d="M16 4l10 4v6c0 7-10 14-10 14S6 21 6 14V8l10-4z" fill="#fff" />
  </svg>,
  // Users
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" key="users">
    <circle cx="12" cy="14" r="4" fill="#fff" />
    <circle cx="20" cy="14" r="4" fill="#fff" />
    <rect x="8" y="20" width="16" height="6" rx="3" fill="#fff" />
  </svg>,
  // Settings (hex)
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" key="settings">
    <polygon points="16,4 28,10 28,22 16,28 4,22 4,10" fill="#fff" />
    <circle cx="16" cy="16" r="3" fill="#000" />
  </svg>,
];

// Logout icon
const logoutIcon = (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" key="logout">
    <path d="M10 16h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 10l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 8v16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const menuLabels = ["Dashboard", "Posts", "Target", "Security", "Users", "Settings"];

const SideBar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(prev => !prev);

  const handleSignout = () => {
    // Clear authentication tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.headerRow}>
        {!collapsed && <span className={styles.title}>Admin Panel</span>}

        {/* Always visible toggle button */}
        <button
          onClick={toggleSidebar}
          className={styles.toggleBtn}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {/* Arrow points LEFT when expanded, RIGHT when collapsed */}
            <path
              d={collapsed ? "M6 3L12 9L6 15" : "M12 3L6 9L12 15"}
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className={styles.iconList}>
        {icons.map((icon, i) => (
          <button
            className={styles.iconBtn}
            key={i}
            onClick={() => {
              if (i === 0) navigate("/dashboard");
              else if (i === 1) navigate("/post");
              else if (i === 2) navigate("/target");
              else if (i === 3) navigate("/security");
              else if (i === 4) navigate("/users");
              else if (i === 5) navigate("/settings");
            }}
            title={collapsed ? menuLabels[i] : ""}
          >
            {icon}
            {!collapsed && <span className={styles.iconLabel}>{menuLabels[i]}</span>}
          </button>
        ))}
      </div>

      {/* Signout button at the bottom */}
      <div className={styles.signoutSection}>
        <button
          className={styles.signoutBtn}
          onClick={handleSignout}
          title={collapsed ? "Sign Out" : ""}
        >
          {logoutIcon}
          {!collapsed && <span className={styles.iconLabel}>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default SideBar;