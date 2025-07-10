import { Routes, Route } from "react-router-dom";
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";
import Post from "../Components/Post";
import Dashboard from "../Components/Dashboard";
import User from "../Components/User";

const CenteredMessage = ({ text }: { text: string }) => (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "100%",
      color: "#fff",
    }}
  >
    <h1 style={{ textAlign: "center" }}>{text}</h1>
  </div>
);

const MainLayout = () => {
  return (
    <>
      <NavBar />
      <div className="main-layout">
        <SideBar />
        <div className="content">
          <Routes>
            <Route path="/post/*" element={<Post />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/target/*" element={<CenteredMessage text="Coming Soon" />} />
            <Route path="/security/*" element={<CenteredMessage text="Coming Soon" />} />
            <Route path="/users/*" element={<User />} />
            <Route path="/settings/*" element={<CenteredMessage text="Coming Soon" />} />
            <Route path="*" element={<div>Welcome to ReachOn Admin Panel</div>} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
