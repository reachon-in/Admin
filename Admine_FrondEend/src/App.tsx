import "./App.css";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";
import Login from "./Components/Login";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
