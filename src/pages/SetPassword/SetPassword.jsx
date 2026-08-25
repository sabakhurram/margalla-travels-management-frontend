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
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] = useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [isRecovery, setIsRecovery] =
    useState(false);

  useEffect(() => {
    let recoveryDetected = false;

    /*
     * Listen for Supabase authentication events.
     *
     * PASSWORD_RECOVERY is triggered when the user
     * opens a password reset link.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          recoveryDetected = true;
          setIsRecovery(true);
        }
      }
    );

    const initializePasswordSession = async () => {
      try {
        setError("");

        const params = new URLSearchParams(
          window.location.search
        );

        const code = params.get("code");

        /*
         * Check if Supabase has already established
         * a session from a password recovery link.
         */
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          /*
           * The recovery event should identify
           * password reset sessions.
           */
          setIsRecovery(recoveryDetected);

          console.log(
            "Password session established:",
            session.user.email
          );

          return;
        }

        /*
         * Driver invitation links contain an
         * authorization code that must be exchanged
         * for a Supabase session.
         */
        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(
              code
            );

          if (error) {
            console.error(
              "Password session error:",
              error
            );

            setError(
              "This password link is invalid or has expired. Please request a new one."
            );

            return;
          }

          /*
           * Remove the authorization code
           * from the browser URL.
           */
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          const {
            data: { session: newSession },
          } = await supabase.auth.getSession();

          if (!newSession) {
            setError(
              "Unable to establish your password session. Please request a new link."
            );

            return;
          }

          /*
           * If PASSWORD_RECOVERY was not triggered,
           * this is treated as the driver invitation
           * flow.
           */
          setIsRecovery(recoveryDetected);

          console.log(
            "Password session established:",
            newSession.user.email
          );

          return;
        }

        /*
         * No session and no valid authorization code.
         */
        setError(
          "This password link is invalid or has expired. Please request a new one."
        );

      } catch (error) {
        console.error(
          "Initialize password session error:",
          error
        );

        setError(
          "Unable to verify your password link. Please try again."
        );
      } finally {
        setCheckingSession(false);
      }
    };

    initializePasswordSession();

    /*
     * Clean up the auth event listener.
     */
    return () => {
      subscription.unsubscribe();
    };
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

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Your password session has expired. Please request a new link."
        );
      }

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 2000);

    } catch (error) {
      console.error(
        "Password update error:",
        error
      );

      setError(
        error.message ||
          "Failed to update your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="set-password-page">
        <div className="set-password-card">
          <p>
            Verifying your password link...
          </p>
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

              <h1>
                {isRecovery
                  ? "Reset Your Password"
                  : "Set Your Password"}
              </h1>

              <p>
                {isRecovery
                  ? "Create a new password for your Margalla Travels account."
                  : "Create a password to access your Margalla Travels driver account."}
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

                  <label>
                    New Password
                  </label>

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
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
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

                  <label>
                    Confirm Password
                  </label>

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
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
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
                    ? isRecovery
                      ? "Resetting Password..."
                      : "Setting Password..."
                    : isRecovery
                    ? "Reset Password"
                    : "Set Password"}
                </button>

              </form>
            )}

          </>
        ) : (
          <div className="set-password-success">

            <CheckCircle size={42} />

            <h2>
              {isRecovery
                ? "Password Reset Successfully"
                : "Password Set Successfully"}
            </h2>

            <p>
              {isRecovery
                ? "Your password has been updated. Redirecting you to the login page..."
                : "Your driver account is ready. Redirecting you to the login page..."}
            </p>

          </div>
        )}

      </div>
    </div>
  );
}

export default SetPassword;