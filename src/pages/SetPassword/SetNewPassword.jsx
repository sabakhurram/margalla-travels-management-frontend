import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";

import "../Login/Login.css";

function SetNewPassword() {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: updateError } =
        await supabase.auth.updateUser({
          password: password,
          data: {
            must_reset_password: false,
          },
        });

      if (updateError) {
        console.error("Set new password error:", updateError);
        setError(updateError.message || "Failed to set new password.");
        return;
      }

      console.log("Password updated successfully:", data.user);

      // Refresh the session so AuthContext gets the updated metadata
      await supabase.auth.refreshSession();

      // Send the user to the correct dashboard
      if (profile?.role === "driver") {
        navigate("/driver-dashboard", { replace: true });
      } else if (profile?.role === "admin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Set password error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "12px",
          }}
        >
          <ShieldCheck size={40} />
        </div>

        <h1>Set a New Password</h1>

        <p className="login-subtitle">
          For your security, you need to set a new password before
          continuing.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />

              <div className="input-content">
                <label htmlFor="password">
                  New Password
                </label>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter a new password"
                  required
                />
              </div>

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((prev) => !prev)
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

          <div className="input-group">
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />

              <div className="input-content">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Re-enter the new password"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            <span>
              {loading ? "Saving..." : "Set Password"}
            </span>
          </button>

        </form>

        <button
          type="button"
          onClick={logout}
          style={{
            marginTop: "16px",
            background: "none",
            border: "none",
            color: "#888",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Log out instead
        </button>

      </div>
    </div>
  );
}

export default SetNewPassword;