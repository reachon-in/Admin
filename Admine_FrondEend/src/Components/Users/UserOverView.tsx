import React, { useState, useEffect } from "react";
import styles from "./Css/UserOverView.module.css";
import { userService, overviewService } from "../../../services/api";
import { FiSearch } from "react-icons/fi";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  signup: string;
  lastLogin: string;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchUsers = async (query: string = "") => {
    setLoading(true);
    try {
      let response;
      if (query.trim() === "") {
        response = await overviewService.getAllUsers(); // fetch all users
      } else {
        response = await userService.getSearchedUsers(query); // fetch filtered users
      }
      setUsers(response || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // Initial fetch
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchUsers(query); // fetch based on new query
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.heading}>Users/Creators</div>

      <div className={styles.searchContainer}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <div className={styles.loader}>Loading user data...</div>
      ) : users.length === 0 ? (
        <div className={styles.loader}>No User Found</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Sign up date</th>
              <th>Last active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className={styles.userId}>{user._id}</td>
                <td className={styles.name}>{user.username}</td>
                <td className={styles.email}>{user.email}</td>
                <td>
                  <span className={styles.roleBadge}>{user.role}</span>
                </td>
                <td className={styles.signup}>
                  {new Date(user.signup).toLocaleDateString()}
                </td>
                <td className={styles.lastActive}>
                  {new Date(user.lastLogin).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserTable;
