import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Wrap this around your existing routed content (inside App.jsx,
// around wherever your <Routes> currently sit). If the logged-in
// user still has a temp password, they're redirected to
// /set-password no matter what page they try to visit —
// except that page itself, and the login page.
function PasswordResetGuard({ children }) {
  const { user, mustResetPassword, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // or your existing loading spinner
  }

  const exemptPaths = ["/set-password", "/login"];

  if (
    user &&
    mustResetPassword &&
    !exemptPaths.includes(location.pathname)
  ) {
    return <Navigate to="/set-password" replace />;
  }

  return children;
}

export default PasswordResetGuard;