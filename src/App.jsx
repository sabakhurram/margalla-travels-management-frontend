import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Login from "./pages/Login/Login";
import Welcome from "./pages/Welcome/Welcome";

import { useAuth } from "./context/AuthContext";
import DriverDashboard from "./pages/DriverDashboard/DriverDashboard";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
function Dashboard() {
  const { user, profile, loading } = useAuth();
    const { logout } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Email: {user?.email}</p>
      <p>Name: {profile?.name}</p>
      <p>Role: {profile?.role}</p>
      <p>
        Status: {profile?.is_active ? "Active" : "Inactive"}
      </p>
       <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />

         <Route
  path="/dashboard"
  element={
    <RoleProtectedRoute role="admin">
      <AdminDashboard/>
    </RoleProtectedRoute>
  }
/>
         <Route
  path="/driver-dashboard"
  element={
    <RoleProtectedRoute role="driver">
      <DriverDashboard />
    </RoleProtectedRoute>
  }
/>

          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;