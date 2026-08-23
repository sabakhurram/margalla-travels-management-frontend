import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Plus, Pencil, Trash2, UserRound } from "lucide-react";

import "./Drivers.css";

function Drivers({ filteredDriverIds = null }) {
  const { session } = useAuth();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

 const [formData, setFormData] = useState({
  name: "",
  phone: "",
  email: "",
  status: "active",
});
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/drivers",
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
    email: "",
    status: "active",
  });

  setShowForm(true);
};

const openEditForm = (driver) => {
  setEditingDriver(driver);

  setFormData({
    name: driver.name || "",
    phone: driver.phone || "",
    email: "",
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
    email: "",
    status: "active",
  });
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const url = editingDriver
        ? `http://localhost:5000/api/drivers/${editingDriver.id}`
        : "http://localhost:5000/api/drivers";

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
      }

      closeForm();
    } catch (error) {
      console.error("Save driver error:", error);
      setError(error.message);
    }
  };

  const handleDelete = async (driver) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${driver.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/drivers/${driver.id}`,
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
        prev.filter((item) => item.id !== driver.id)
      );
    } catch (error) {
      console.error("Delete driver error:", error);
      setError(error.message);
    }
  };
const displayedDrivers = filteredDriverIds
  ? drivers.filter((driver) =>
      filteredDriverIds.includes(driver.id)
    )
  : drivers;
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
    <label>Email</label>

    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      placeholder="Enter driver's email"
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

            <h3>No drivers found</h3>

            <p>
              Add your first driver to get started.
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

                        <button
                          className="driver-edit-btn"
                          onClick={() =>
                            openEditForm(driver)
                          }
                          title="Edit driver"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="driver-delete-btn"
                          onClick={() =>
                            handleDelete(driver)
                          }
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

    </div>
  );
}

export default Drivers;