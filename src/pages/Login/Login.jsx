import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react";

import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";

import "./Login.css";
import logo from "../../assets/teal-logo.png";

function Login() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, []);

  
useEffect(() => {
  const rememberedUsername = localStorage.getItem("rememberedUsername");

  if (rememberedUsername) {
    setUsername(rememberedUsername);
    setRememberMe(true);
  }
}, []);

useEffect(() => {
  if (authLoading) return;

  if (!user || !profile) return;

  // User was created with a temporary password
  if (user.user_metadata?.must_reset_password === true) {
    setLoading(false);
    navigate("/set-password", { replace: true });
    return;
  }

  // Normal login
  setLoading(false);

  if (profile.role === "admin") {
    navigate("/dashboard", { replace: true });
  } else if (profile.role === "driver") {
    navigate("/driver-dashboard", { replace: true });
  }
}, [user, profile, authLoading, navigate]);

const handleLogin = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  const normalizedUsername = username.trim().toLowerCase();

  if (rememberMe) {
    localStorage.setItem("rememberedUsername", normalizedUsername);
  } else {
    localStorage.removeItem("rememberedUsername");
  }

  try {
   const response = await fetch("https://api.margallatravels.com.pk/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: normalizedUsername,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Invalid username or password");
      setLoading(false);
      return;
    }

    if (!data.session?.access_token || !data.session?.refresh_token) {
      setError("Login session was not returned. Please try again.");
      setLoading(false);
      return;
    }

 const { data: sessionData, error: sessionError } =
  await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

if (sessionError) {
  setError("Failed to establish session. Please try again.");
  setLoading(false);
  return;
}

// Login is complete.
// AuthContext will load the profile and the useEffect will redirect.
setLoading(false);

    // Don't navigate here.
    // AuthContext will update user/profile and the useEffect above
    // will decide whether to go to set-password or dashboard.

  } catch (err) {
    console.error("Login error:", err);
    setError("Server error during login. Please try again.");
    setLoading(false);
  }
};


  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="Margalla Travels" className="login-logo" />
        <h1>Welcome Back!</h1>
        <p className="login-subtitle">Sign in to continue to your account</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <div className="input-content">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <div className="input-content">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <span className="forgot-password-note">
              Forgot password? Contact your administrator.
            </span>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            <LogIn size={19} />
            <span>{loading ? "Logging in..." : "Sign In"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;