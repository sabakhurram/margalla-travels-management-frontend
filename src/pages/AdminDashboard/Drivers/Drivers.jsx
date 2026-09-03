import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Plus, Pencil, Trash2, UserRound,KeyRound , Copy, Check } from "lucide-react";

import "./Drivers.css";

function Drivers({
  filteredDriverIds = null,
  searchQuery = "",
}) {
  const { session } = useAuth();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [driverToReset, setDriverToReset] = useState(null);
  

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    username: "",
    status: "active",
  });

  // Shown once right after a driver is created, since there's
  // no email to deliver the password through automatically.
  const [tempPasswordInfo, setTempPasswordInfo] = useState(null);
  const [copied, setCopied] = useState(false);
const [resettingPassword, setResettingPassword] =
  useState(null);
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://api.margallatravels.com.pk/api/drivers",
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch drivers"
        );
      }

      setDrivers(data.drivers || []);
    } catch (error) {
      console.error("Fetch drivers error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingDriver(null);

    setFormData({
      name: "",
      phone: "",
      username: "",
      status: "active",
    });

    setShowForm(true);
  };

  const openEditForm = (driver) => {
    setEditingDriver(driver);

    setFormData({
      name: driver.name || "",
      phone: driver.phone || "",
      username: "",
      status: driver.status || "active",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDriver(null);

    setFormData({
      name: "",
      phone: "",
      username: "",
      status: "active",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const url = editingDriver
        ? `https://api.margallatravels.com.pk/api/drivers/${editingDriver.id}`
        : "https://api.margallatravels.com.pk/api/drivers";

      const method = editingDriver ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save driver"
        );
      }

      if (editingDriver) {
        setDrivers((prev) =>
          prev.map((driver) =>
            driver.id === editingDriver.id
              ? data.driver
              : driver
          )
        );
      } else {
        setDrivers((prev) => [...prev, data.driver]);

        // New driver created — show the temp password once.
        if (data.tempPassword) {
          setTempPasswordInfo({
            username: formData.username,
            password: data.tempPassword,
            name: formData.name,
          });
        }
      }

      closeForm();
    } catch (error) {
      console.error("Save driver error:", error);
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    if (!driverToDelete) return;

    try {
      setError("");

      const response = await fetch(
        `https://api.margallatravels.com.pk/api/drivers/${driverToDelete.id}`,
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
          data.message || "Failed to delete driver"
        );
      }

      setDrivers((prev) =>
        prev.filter(
          (item) => item.id !== driverToDelete.id
        )
      );

      setDriverToDelete(null);

    } catch (error) {
      console.error("Delete driver error:", error);
      setError(error.message);
      setDriverToDelete(null);
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

  const normalizedSearch = searchQuery
    .trim()
    .toLowerCase();

  const displayedDrivers = drivers.filter((driver) => {
    // Alert filter
    const matchesAlertFilter =
      !filteredDriverIds ||
      filteredDriverIds.includes(driver.id);

    // Search filter
    const matchesSearch =
      !normalizedSearch ||
      [
        driver.name,
        driver.phone,
        driver.status,
        driver.vehicles?.[0]?.registration_number,
        driver.vehicles?.[0]?.model,
      ].some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );

    return matchesAlertFilter && matchesSearch;
  });
const handleResetPassword = async () => {
  if (!driverToReset) return;

  try {
    setError("");

    const response = await fetch(
      `https://api.margallatravels.com.pk/api/drivers/${driverToReset.id}/reset-password`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to reset driver password"
      );
    }

    setTempPasswordInfo({
      username: driverToReset.username,
      password: data.tempPassword,
      name: driverToReset.name,
    });

    setDriverToReset(null);

  } catch (error) {
    console.error("Reset password error:", error);

    setError(
      error.message || "Failed to reset the password."
    );

    setDriverToReset(null);
  }
};
  return (
    <div className="drivers-page">

      <div className="drivers-header">
        <div className="drivers-heading">
          <div className="drivers-heading-icon">
            <UserRound size={24} />
          </div>

          <div>
            <h1>Drivers</h1>
            <p>Manage your drivers and their assignments</p>
          </div>
        </div>

        <button
          className="drivers-add-btn"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Driver
        </button>
      </div>

      {error && (
        <div className="drivers-error">
          {error}
        </div>
      )}

      {showForm && (
        <div className="drivers-form-card">
          <div className="drivers-form-header">
            <div>
              <h2>
                {editingDriver
                  ? "Edit Driver"
                  : "Add Driver"}
              </h2>

              <p>
                {editingDriver
                  ? "Update driver information"
                  : "Add a new driver"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {!editingDriver && (
              <div className="drivers-form-group">
                <label>Username</label>

                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. driver phone number or employee ID"
                  required
                />
              </div>
            )}

            <div className="drivers-form-row">

              <div className="drivers-form-group">
                <label>Driver Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter driver name"
                  required
                />
              </div>

              <div className="drivers-form-group">
                <label>Phone</label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

            </div>

            <div className="drivers-form-group">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="drivers-form-actions">

              <button
                type="button"
                className="drivers-cancel-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="drivers-save-btn"
              >
                {editingDriver
                  ? "Update Driver"
                  : "Add Driver"}
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="drivers-table-card">

        {loading ? (
          <div className="drivers-loading">
            Loading drivers...
          </div>
        ) : displayedDrivers.length === 0 ? (
          <div className="drivers-empty">
            <UserRound size={40} />

            <h3>
              {searchQuery.trim()
                ? "No matching drivers found"
                : "No drivers found"}
            </h3>

            <p>
              {searchQuery.trim()
                ? `No drivers match "${searchQuery}".`
                : "Add your first driver to get started."}
            </p>
          </div>
        ) : (
          <div className="drivers-table-wrapper">

            <table className="drivers-table">

              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Phone</th>
                  <th>Assigned Vehicle</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {displayedDrivers.map((driver) => (
                  <tr key={driver.id}>

                    <td>
                      <div className="driver-name-cell">
                        <div className="driver-avatar">
                          <UserRound size={17} />
                        </div>

                        <span>{driver.name}</span>
                      </div>
                    </td>

                    <td>
                      {driver.phone}
                    </td>

                    <td>
                      {driver.vehicles?.length > 0
                        ? driver.vehicles[0]
                            .registration_number
                        : "Not Assigned"}
                    </td>

                    <td>
                      <span
                        className={`driver-status ${driver.status}`}
                      >
                        {driver.status}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        driver.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td>
                     <div className="driver-actions">

  {/* Reset Password */}
  <button
    className="driver-reset-btn"
     onClick={() => setDriverToReset(driver)}
    title="Reset password"
    disabled={resettingPassword === driver.id}
  >
    <KeyRound size={17} />
  </button>

  {/* Edit */}
  <button
    className="driver-edit-btn"
    onClick={() => openEditForm(driver)}
    title="Edit driver"
  >
    <Pencil size={17} />
  </button>

  {/* Delete */}
  <button
    className="driver-delete-btn"
    onClick={() => setDriverToDelete(driver)}
    title="Delete driver"
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

      {driverToDelete && (
        <div className="delete-modal-overlay">

          <div className="delete-modal">

            <div className="delete-modal-icon">
              <Trash2 size={24} />
            </div>

            <h2>Delete Driver?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{driverToDelete.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="delete-modal-actions">

              <button
                className="delete-modal-cancel"
                onClick={() => setDriverToDelete(null)}
              >
                Cancel
              </button>

              <button
                className="delete-modal-confirm"
                onClick={handleDelete}
              >
                Delete Driver
              </button>

            </div>

          </div>

        </div>
      )}

      {tempPasswordInfo && (
        <div className="delete-modal-overlay">

          <div className="delete-modal">

            <h2>
  {tempPasswordInfo.isReset
    ? "Driver Password Reset"
    : "Driver Account Created"}
</h2>

          <p>
  {tempPasswordInfo.isReset ? (
    <>
      A new temporary password has been generated for{" "}
      <strong>{tempPasswordInfo.name}</strong>.
      Share these credentials directly with the driver.
      The driver will be required to create a new password
      after logging in.
    </>
  ) : (
    <>
      Share these credentials with{" "}
      <strong>{tempPasswordInfo.name}</strong> directly
      (in person, SMS, or WhatsApp). This password will
      only be shown once.
    </>
  )}
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
{driverToReset && (
  <div className="delete-modal-overlay">

    <div className="delete-modal">

      <div className="delete-modal-icon">
        <KeyRound size={24} />
      </div>

      <h2>Reset Driver Password?</h2>

      <p>
        Are you sure you want to reset the password for{" "}
        <strong>{driverToReset.name}</strong>?
      </p>

      <p>
        A new temporary password will be generated. The driver
        will be required to create a new password after logging in.
      </p>

      <div className="delete-modal-actions">

        <button
          className="delete-modal-cancel"
          onClick={() => setDriverToReset(null)}
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
    </div>
  );
}

export default Drivers;