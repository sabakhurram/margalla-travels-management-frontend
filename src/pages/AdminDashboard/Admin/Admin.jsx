import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  Plus,
  ShieldCheck,
  Copy,
  Check,
  Trash2,
  KeyRound,
} from "lucide-react";

import "../Drivers/Drivers.css";// reusing the same styling as Drivers page

function Admins() {
  const { session } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
  });

  const [tempPasswordInfo, setTempPasswordInfo] = useState(null);
  const [copied, setCopied] = useState(false);
const [adminToReset, setAdminToReset] = useState(null);
const [adminToDelete, setAdminToDelete] = useState(null);

const [resetPasswordInfo, setResetPasswordInfo] = useState(null);
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/auth/admins", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admins");
      }

      setAdmins(data.admins || []);
    } catch (error) {
      console.error("Fetch admins error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setFormData({ name: "", username: "", email: "" });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({ name: "", username: "", email: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/auth/create-admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create admin");
      }

      setTempPasswordInfo({
        username: formData.username,
        password: data.tempPassword,
        name: formData.name,
      });

      closeForm();
      fetchAdmins(); // refresh the list to include the new admin
    } catch (error) {
      console.error("Create admin error:", error);
      setError(error.message);
    }
  };

  const handleCopyCredentials = () => {
    if (!tempPasswordInfo) return;

    const text = `Username: ${tempPasswordInfo.username}\nTemporary Password: ${tempPasswordInfo.password}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
const handleResetPassword = async () => {
  if (!adminToReset) return;

  try {
    setError("");

    const response = await fetch(
      `http://localhost:5000/api/admins/${adminToReset.id}/reset-password`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to reset password"
      );
    }

    setAdminToReset(null);

    setResetPasswordInfo({
      name: adminToReset.name,
      username: adminToReset.username,
      password: data.tempPassword,
    });

  } catch (error) {
    console.error("Reset password error:", error);
    setError(error.message);
  }
};
const handleDeleteAdmin = async () => {
  if (!adminToDelete) return;

  try {
    setError("");

    const response = await fetch(
      `http://localhost:5000/api/admins/${adminToDelete.id}`,
      {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete admin"
      );
    }

    setAdmins((prev) =>
      prev.filter(
        (admin) => admin.id !== adminToDelete.id
      )
    );

    setAdminToDelete(null);

  } catch (error) {
    console.error("Delete admin error:", error);
    setError(error.message);
    setAdminToDelete(null);
  }
};
  return (
    <div className="drivers-page">
      <div className="drivers-header">
        <div className="drivers-heading">
          <div className="drivers-heading-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h1>Admins</h1>
            <p>Manage administrator accounts</p>
          </div>
        </div>

        <button className="drivers-add-btn" onClick={openAddForm}>
          <Plus size={18} />
          Add Admin
        </button>
      </div>

      {error && <div className="drivers-error">{error}</div>}

      {showForm && (
        <div className="drivers-form-card">
          <div className="drivers-form-header">
            <div>
              <h2>Add Admin</h2>
              <p>Create a new administrator account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="drivers-form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a login username"
                required
              />
            </div>

            <div className="drivers-form-row">
              <div className="drivers-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="drivers-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Real email — used for password recovery"
                  required
                />
              </div>
            </div>

            <div className="drivers-form-actions">
              <button
                type="button"
                className="drivers-cancel-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button type="submit" className="drivers-save-btn">
                Add Admin
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="drivers-table-card">
        {loading ? (
          <div className="drivers-loading">Loading admins...</div>
        ) : admins.length === 0 ? (
          <div className="drivers-empty">
            <ShieldCheck size={40} />
            <h3>No admins found</h3>
            <p>Add your first admin account to get started.</p>
          </div>
        ) : (
          <div className="drivers-table-wrapper">
            <table className="drivers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.name}</td>
                    <td>{admin.username}</td>
                    <td>{admin.email}</td>
                    <td>
                      <span
                        className={`driver-status ${
                          admin.is_active ? "active" : "inactive"
                        }`}
                      >
                        {admin.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td>
  <div className="driver-actions">

    <button
      className="driver-edit-btn"
      onClick={() => setAdminToReset(admin)}
      title="Reset password"
    >
      <KeyRound size={17} />
    </button>

    <button
      className="driver-delete-btn"
      onClick={() => setAdminToDelete(admin)}
      title="Delete admin"
    >
      <Trash2 size={17} />
    </button>

  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {tempPasswordInfo && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h2>Admin Account Created</h2>

            <p>
              Share these credentials with{" "}
              <strong>{tempPasswordInfo.name}</strong>, or since they have a
              real email, you could send this via email yourself. This
              password is shown only once.
            </p>

            <div
              style={{
                background: "#f5f5f5",
                borderRadius: "8px",
                padding: "12px 16px",
                margin: "16px 0",
                fontFamily: "monospace",
                fontSize: "14px",
                textAlign: "left",
              }}
            >
              <div>Username: {tempPasswordInfo.username}</div>
              <div>Password: {tempPasswordInfo.password}</div>
            </div>

            <div className="delete-modal-actions">
              <button
                className="drivers-cancel-btn"
                onClick={handleCopyCredentials}
              >
                {copied ? (
                  <>
                    <Check size={16} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy
                  </>
                )}
              </button>

              <button
                className="delete-modal-confirm"
                onClick={() => setTempPasswordInfo(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {adminToReset && (
  <div className="delete-modal-overlay">

    <div className="delete-modal">

      <div className="delete-modal-icon">
        <KeyRound size={24} />
      </div>

      <h2>Reset Admin Password?</h2>

      <p>
        A new temporary password will be generated for{" "}
        <strong>{adminToReset.name}</strong>.
        They will be required to set a new password
        when they next log in.
      </p>

      <div className="delete-modal-actions">

        <button
          className="delete-modal-cancel"
          onClick={() => setAdminToReset(null)}
        >
          Cancel
        </button>

        <button
          className="delete-modal-confirm"
          onClick={handleResetPassword}
        >
          Reset Password
        </button>

      </div>

    </div>

  </div>
)}
{adminToDelete && (
  <div className="delete-modal-overlay">

    <div className="delete-modal">

      <div className="delete-modal-icon">
        <Trash2 size={24} />
      </div>

      <h2>Delete Admin?</h2>

      <p>
        Are you sure you want to delete{" "}
        <strong>{adminToDelete.name}</strong>?
        This action cannot be undone.
      </p>

      <div className="delete-modal-actions">

        <button
          className="delete-modal-cancel"
          onClick={() => setAdminToDelete(null)}
        >
          Cancel
        </button>

        <button
          className="delete-modal-confirm"
          onClick={handleDeleteAdmin}
        >
          Delete Admin
        </button>

      </div>

    </div>

  </div>
)}
{resetPasswordInfo && (
  <div className="delete-modal-overlay">

    <div className="delete-modal">

      <h2>Password Reset Successfully</h2>

      <p>
        A new temporary password has been generated for{" "}
        <strong>{resetPasswordInfo.name}</strong>.
      </p>

      <div
        style={{
          background: "#f5f5f5",
          borderRadius: "8px",
          padding: "12px 16px",
          margin: "16px 0",
          fontFamily: "monospace",
          fontSize: "14px",
          textAlign: "left",
        }}
      >
        <div>
          Username: {resetPasswordInfo.username}
        </div>

        <div>
          Password: {resetPasswordInfo.password}
        </div>
      </div>

      <div className="delete-modal-actions">

        <button
          className="drivers-cancel-btn"
          onClick={() => {
            const text =
              `Username: ${resetPasswordInfo.username}\n` +
              `Temporary Password: ${resetPasswordInfo.password}`;

            navigator.clipboard.writeText(text);
          }}
        >
          <Copy size={16} />
          Copy
        </button>

        <button
          className="delete-modal-confirm"
          onClick={() =>
            setResetPasswordInfo(null)
          }
        >
          Done
        </button>

      </div>

    </div>

  </div>
)}
    </div>
  );
}

export default Admins;