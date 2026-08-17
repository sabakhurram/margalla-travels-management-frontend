import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

import { supabase } from "../../config/supabase";

import "./SetPassword.css";

function SetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const initializeInvitation = async () => {
      try {
        setError("");

        /*
         * Supabase invitation links can contain a temporary
         * authorization code.
         *
         * We exchange that code for a real Supabase session.
         */

        const params = new URLSearchParams(
          window.location.search
        );

        const code = params.get("code");

        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error(
              "Invitation session error:",
              error
            );

            setError(
              "This invitation link is invalid or has expired. Please ask the administrator to send a new invitation."
            );

            return;
          }

          // Remove the code from the browser URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }

        /*
         * Now check whether Supabase has a valid session.
         */

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError(
            "This invitation link is invalid or has expired. Please ask the administrator to send a new invitation."
          );

          return;
        }

        console.log(
          "Invitation session established:",
          session.user.email
        );
      } catch (error) {
        console.error(
          "Initialize invitation error:",
          error
        );

        setError(
          "Unable to verify your invitation. Please try again."
        );
      } finally {
        setCheckingSession(false);
      }
    };

    initializeInvitation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      /*
       * Make sure a session still exists before
       * attempting to change the password.
       */

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Your invitation session has expired. Please request a new invitation."
        );
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(
        "Set password error:",
        error
      );

      setError(
        error.message ||
          "Failed to set password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="set-password-page">
        <div className="set-password-card">
          <p>Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="set-password-page">
      <div className="set-password-card">

        <div className="set-password-icon">
          <LockKeyhole size={24} />
        </div>

        {!success ? (
          <>
            <div className="set-password-header">
              <h1>Set Your Password</h1>

              <p>
                Create a password to access your
                Margalla Travels driver account.
              </p>
            </div>

            {error && (
              <div className="set-password-error">
                {error}
              </div>
            )}

            {!error && (
              <form onSubmit={handleSubmit}>

                <div className="set-password-group">
                  <label>New Password</label>

                  <div className="set-password-input-wrapper">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      disabled={loading}
                      required
                    />

                    <button
                      type="button"
                      className="set-password-eye"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="set-password-group">
                  <label>Confirm Password</label>

                  <div className="set-password-input-wrapper">
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Confirm your password"
                      disabled={loading}
                      required
                    />

                    <button
                      type="button"
                      className="set-password-eye"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="set-password-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Setting Password..."
                    : "Set Password"}
                </button>

              </form>
            )}
          </>
        ) : (
          <div className="set-password-success">

            <CheckCircle size={42} />

            <h2>
              Password Set Successfully
            </h2>

            <p>
              Your driver account is ready.
              Redirecting you to the login page...
            </p>

          </div>
        )}

      </div>
    </div>
  );
}

export default SetPassword;