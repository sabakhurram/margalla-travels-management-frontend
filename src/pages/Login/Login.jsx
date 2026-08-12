import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";
import logo from "../../assets/teal-logo.png";

function Login() {
  const navigate = useNavigate();
const { user, profile, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
   
  };
useEffect(() => {
  if (authLoading || !user || !profile) {
    return;
  }

  if (profile.role === "admin") {
    navigate("/dashboard", { replace: true });
  } else if (profile.role === "driver") {
    navigate("/driver-dashboard", { replace: true });
  }
}, [user, profile, authLoading, navigate]);
  return (
    <div className="login-page">
      <div className="login-card">

        <img
          src={logo}
          alt="Margalla Travels"
          className="login-logo"
        />

        <h1>Welcome Back!</h1>

        <p className="login-subtitle">
          Sign in to continue to your account
        </p>

        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="input-group">
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />

              <div className="input-content">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />

              <div className="input-content">
                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          {/* Remember + Forgot */}
          <div className="login-options">

            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password"
            >
              Forgot password?
            </button>

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            <LogIn size={19} />

            <span>
              {loading ? "Logging in..." : "Sign In"}
            </span>
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;