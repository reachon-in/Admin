import { useState, useEffect } from "react";
import styles from "./Css/Overview.module.css";
import { overviewService } from "../../../services/api";

const Overview = () => {
  const [stats, setStats] = useState([
    { label: "Total Users", value: "0" },
    { label: "Active Users", value: "10,000" },
    { label: "Daily New Users", value: "1,500" },
    { label: "Users Online", value: "500" },
  ]);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const response = await overviewService.getAllUsers();
        const totalUsers = response.length;
        setStats(prevStats => 
          prevStats.map(stat => 
            stat.label === "Total Users" 
              ? { ...stat, value: totalUsers.toLocaleString() }
              : stat
          )
        );
      } catch (error) {
        console.error("Error fetching total users:", error);
      }
    };

    fetchTotalUsers();
  }, []);

  const ChartPlaceholder = () => (
    <div className={styles.chartPlaceholder}>
      {/* Replace with actual chart
      <svg width="100%" height="80" viewBox="0 0 200 80">
        <path d="M0,70 Q40,10 80,40 Q120,70 160,20 Q200,70 200,70" fill="#eaf6ff" stroke="#bcd6ee" strokeWidth="2"/>
        <path d="M0,70 Q40,10 80,40 Q120,70 160,20 Q200,70 200,80 L0,80 Z" fill="#eaf6ff" opacity="0.5"/>
      </svg> */}
    </div>
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard Overview</h1>
      <div className={styles.statsRow}>
        {stats.map((stat) => (
          <div className={styles.statCard} key={stat.label}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue}>{stat.value}</span>
          </div>
        ))}
      </div>
      <div className={styles.chartsSection}>
        <div className={styles.chartBlock}>
          <h2 className={styles.chartTitle}>Daily Active Users</h2>
          <div className={styles.chartsRow}>
            <ChartPlaceholder />
            <ChartPlaceholder />
            <ChartPlaceholder />
            <ChartPlaceholder />
          </div>
        </div>
        <div className={styles.chartBlock}>
          <h2 className={styles.chartTitle}>Daily New Users</h2>
          <div className={styles.chartsRow}>
            <ChartPlaceholder />
            <ChartPlaceholder />
            <ChartPlaceholder />
            <ChartPlaceholder />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
