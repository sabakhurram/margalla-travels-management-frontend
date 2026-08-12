import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function RoleProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Profile hasn't loaded
  if (!profile) {
    return <p>Loading profile...</p>;
  }

  // Wrong role
  if (profile.role !== role) {
    if (profile.role === "admin") {
      return <Navigate to="/dashboard" replace />;
    }

    if (profile.role === "driver") {
      return <Navigate to="/driver-dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RoleProtectedRoute;