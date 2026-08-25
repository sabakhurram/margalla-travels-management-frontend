import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";

import "./Login.css";
import logo from "../../assets/teal-logo.png";

function Login() {
  const navigate = useNavigate();

  const {
    user,
    profile,
    loading: authLoading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  /*
   * Load remembered email when the login page opens.
   */
  useEffect(() => {
    const rememberedEmail =
      localStorage.getItem("rememberedEmail");

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  /*
   * Redirect authenticated users
   * according to their role.
   */
  useEffect(() => {
    if (authLoading || !user || !profile) {
      return;
    }

    if (profile.role === "admin") {
      navigate("/dashboard", { replace: true });
    } else if (profile.role === "driver") {
      navigate("/driver-dashboard", {
        replace: true,
      });
    }
  }, [
    user,
    profile,
    authLoading,
    navigate,
  ]);

  /*
   * Handle login.
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    /*
     * Remember only the email address.
     * Never store the password.
     */
    if (rememberMe) {
      localStorage.setItem(
        "rememberedEmail",
        email
      );
    } else {
      localStorage.removeItem(
        "rememberedEmail"
      );
    }

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    /*
     * AuthContext will detect the new session
     * and the useEffect above will redirect
     * according to the user's role.
     */
  };

  /*
   * Handle forgot password.
   */
  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    /*
     * Make sure the user has entered an email.
     */
    if (!email.trim()) {
      setError(
        "Please enter your email address first."
      );
      return;
    }

    try {
      setForgotLoading(true);

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/set-password`,
          }
        );

      if (error) {
        throw error;
      }

      setSuccess(
        "Password reset instructions have been sent to your email."
      );
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setError(
        error.message ||
          "Unable to send password reset email. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

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
              <Mail
                className="input-icon"
                size={20}
              />

              <div className="input-content">
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <div className="input-wrapper">
              <Lock
                className="input-icon"
                size={20}
              />

              <div className="input-content">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
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

          {/* Success */}
          {success && (
            <p className="login-success">
              {success}
            </p>
          )}

          {/* Remember + Forgot */}
          <div className="login-options">

            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
              />

              <span>
                Remember me
              </span>
            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={handleForgotPassword}
              disabled={forgotLoading}
            >
              {forgotLoading
                ? "Sending..."
                : "Forgot password?"}
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
              {loading
                ? "Logging in..."
                : "Sign In"}
            </span>
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;