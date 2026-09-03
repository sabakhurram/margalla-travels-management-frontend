import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  Plus,
  CarFront,
  UserRound,
  CircleAlert,
  RefreshCw,
  Pencil,
    Trash2,
} from "lucide-react";

import "./Vehicles.css";

function Vehicles({ searchQuery }) {
  const { session } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [categories, setCategories] = useState([]);
const [drivers, setDrivers] = useState([]);

const [showForm, setShowForm] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [editingVehicle, setEditingVehicle] = useState(null);
const [updating, setUpdating] = useState(false);
const vehicleFormRef = useRef(null);
const [deleting, setDeleting] = useState(false);
const [vehicleToDelete, setVehicleToDelete] = useState(null);
const [deleteError, setDeleteError] = useState("");
const [vehicleForm, setVehicleForm] = useState({
  registration_number: "",
  model: "",
  category_id: "",
  assigned_driver_id: "",
  status: "active",
});
const normalizedSearch = searchQuery.trim().toLowerCase();

const filteredVehicles = vehicles.filter((vehicle) => {
  if (!normalizedSearch) return true;

  const searchableFields = [
    vehicle.model,
    vehicle.registration_number,
    vehicle.status,
    vehicle.categories?.name,
    vehicle.drivers?.name,
    `vehicle ${vehicle.id}`,
    `${vehicle.id}`,
  ];

  return searchableFields.some((field) =>
    String(field || "")
      .toLowerCase()
      .includes(normalizedSearch)
  );
});
const fetchCategories = async () => {
  try {
    const response = await fetch(
      "https://api.margallatravels.com.pk/api/categories",
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch categories"
      );
    }

    setCategories(data.categories || []);
  } catch (error) {
    console.error("Fetch categories error:", error);
    setError(error.message);
  }
};

const fetchDrivers = async () => {
  try {
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
  }
};
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://api.margallatravels.com.pk/api/vehicles",
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const data = await response.json();

     

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch vehicles"
        );
      }

      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error("Fetch vehicles error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (session?.access_token) {
    fetchVehicles();
    fetchCategories();
    fetchDrivers();
  }
}, [session]);
const handleVehicleChange = (e) => {
  const { name, value } = e.target;

  setVehicleForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};
const handleAddVehicle = async (e) => {
  e.preventDefault();

  if (!vehicleForm.registration_number.trim()) {
    setError("Registration number is required");
    return;
  }

  if (!vehicleForm.model.trim()) {
    setError("Vehicle model is required");
    return;
  }

  if (!vehicleForm.category_id) {
    setError("Please select a category");
    return;
  }

  try {
    setSubmitting(true);
    setError("");

    const response = await fetch(
      "https://api.margallatravels.com.pk/api/vehicles",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          registration_number:
            vehicleForm.registration_number.trim(),
          model: vehicleForm.model.trim(),
          category_id: vehicleForm.category_id,
          assigned_driver_id:
            vehicleForm.assigned_driver_id || null,
          status: vehicleForm.status,
        }),
      }
    );

    const data = await response.json();

   

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to create vehicle"
      );
    }

  await fetchVehicles();

resetVehicleForm();

  

  } catch (error) {
    console.error("Create vehicle error:", error);
    setError(error.message);
  } finally {
    setSubmitting(false);
  }
};
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "status-available";

      case "active":
        return "status-active";

      case "maintenance":
        return "status-maintenance";

      case "inactive":
        return "status-inactive";

      default:
        return "status-default";
    }
  };
const handleUpdateVehicle = async (e) => {
  e.preventDefault();

  if (!vehicleForm.registration_number.trim()) {
    setError("Registration number is required");
    return;
  }

  if (!vehicleForm.model.trim()) {
    setError("Vehicle model is required");
    return;
  }

  if (!vehicleForm.category_id) {
    setError("Please select a category");
    return;
  }

  try {
    setUpdating(true);
    setError("");

    const response = await fetch(
      `https://api.margallatravels.com.pk/api/vehicles/${editingVehicle.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          registration_number:
            vehicleForm.registration_number.trim(),
          model: vehicleForm.model.trim(),
          category_id: vehicleForm.category_id,
          assigned_driver_id:
            vehicleForm.assigned_driver_id || null,
          status: vehicleForm.status,
        }),
      }
    );

    const data = await response.json();


    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update vehicle"
      );
    }

    await fetchVehicles();

  resetVehicleForm();

  } catch (error) {
    console.error("Update vehicle error:", error);
    setError(error.message);
  } finally {
    setUpdating(false);
  }
};
const handleEditVehicle = (vehicle) => {
  setError("");
  setEditingVehicle(vehicle);

  setVehicleForm({
    registration_number: vehicle.registration_number || "",
    model: vehicle.model || "",
    category_id: vehicle.category_id || "",
    assigned_driver_id: vehicle.assigned_driver_id || "",
    status: vehicle.status || "active",
  });

  setShowForm(true);

  setTimeout(() => {
    vehicleFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
};
const resetVehicleForm = () => {
  setShowForm(false);
  setEditingVehicle(null);
  setError("");

  setVehicleForm({
    registration_number: "",
    model: "",
    category_id: "",
    assigned_driver_id: "",
    status: "active",
  });
};
const handleDeleteVehicle = async () => {
  if (!vehicleToDelete) return;

  try {
    setDeleting(true);
    setDeleteError("");

    const response = await fetch(
      `https://api.margallatravels.com.pk/api/vehicles/${vehicleToDelete.id}`,
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
        data.message || "Failed to delete vehicle"
      );
    }

    setVehicles((prevVehicles) =>
      prevVehicles.filter(
        (vehicle) => vehicle.id !== vehicleToDelete.id
      )
    );

    setVehicleToDelete(null);
    setDeleteError("");

  } catch (error) {
    console.error("Delete vehicle error:", error);

    setDeleteError(
      error.message || "Failed to delete vehicle"
    );

  } finally {
    setDeleting(false);
  }
};
  return (
    <div className="vehicles-page">

      {/* Header */}
      <div className="vehicles-header">

        <div className="vehicles-header-content">

          <div className="vehicles-title-icon">
            <CarFront size={24} />
          </div>

          <div>
            <h2>Vehicle Management</h2>

            <p>
              Manage your fleet, assignments, and vehicle status.
            </p>
          </div>

        </div>
<button
  className="add-vehicle-button"
  onClick={() => {
    setError("");
    setShowForm(true);
  }}>
    <Plus size={17} />
  Add Vehicle
</button>

      </div>
{showForm && (
  <div
    className="vehicle-form-card"
    ref={vehicleFormRef}
  >

    <div className="vehicle-form-header">
      <div>
        <h3>
  {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
</h3>

<p>
  {editingVehicle
    ? "Update the vehicle information below."
    : "Add a new vehicle to your fleet."}
</p>
      </div>

     <button
  type="button"
  className="vehicle-form-close"
  onClick={resetVehicleForm}
  disabled={editingVehicle ? updating : submitting}
>
  ×
</button>
    </div>

   <form
  onSubmit={
    editingVehicle
      ? handleUpdateVehicle
      : handleAddVehicle
  }
>
  {error && (
  <div className="vehicle-form-error">
    <CircleAlert size={17} />
    <span>{error}</span>
  </div>
)}

      <div className="vehicle-form-grid">

        <div className="vehicle-form-group">
          <label htmlFor="registration_number">
            Registration Number
          </label>

          <input
            id="registration_number"
            name="registration_number"
            type="text"
            value={vehicleForm.registration_number}
            onChange={handleVehicleChange}
            placeholder="e.g. ABC-123"
            disabled={submitting}
          />
        </div>

        <div className="vehicle-form-group">
          <label htmlFor="model">
            Vehicle Model
          </label>

          <input
            id="model"
            name="model"
            type="text"
            value={vehicleForm.model}
            onChange={handleVehicleChange}
            placeholder="e.g. Toyota Corolla"
            disabled={submitting}
          />
        </div>

        <div className="vehicle-form-group">
          <label htmlFor="category_id">
            Category
          </label>

          <select
            id="category_id"
            name="category_id"
            value={vehicleForm.category_id}
            onChange={handleVehicleChange}
            disabled={submitting}
          >
            <option value="">
              Select category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="vehicle-form-group">
          <label htmlFor="assigned_driver_id">
            Assigned Driver
          </label>

          <select
            id="assigned_driver_id"
            name="assigned_driver_id"
            value={vehicleForm.assigned_driver_id}
            onChange={handleVehicleChange}
            disabled={submitting}
          >
            <option value="">
              Unassigned
            </option>

            {drivers.map((driver) => (
              <option
                key={driver.id}
                value={driver.id}
              >
                {driver.name}
              </option>
            ))}
          </select>
        </div>

        <div className="vehicle-form-group">
          <label htmlFor="status">
            Status
          </label>

          <select
  id="status"
  name="status"
  value={vehicleForm.status}
  onChange={handleVehicleChange}
  disabled={submitting}
>
  <option value="active">
    Active
  </option>

  <option value="inactive">
    Inactive
  </option>

  <option value="maintenance">
    Maintenance
  </option>
</select>
        </div>

      </div>

      <div className="vehicle-form-actions">

    <button
  type="button"
  className="vehicle-form-cancel"
  onClick={resetVehicleForm}
  disabled={editingVehicle ? updating : submitting}
>
  Cancel
</button>

        <button
          type="submit"
          className="vehicle-form-submit"
          disabled={submitting}
        >
         {editingVehicle
  ? updating
    ? "Saving..."
    : "Save Changes"
  : submitting
    ? "Adding..."
    : "Add Vehicle"}
        </button>

      </div>

    </form>

  </div>
)}
      {/* Stats */}
      <div className="vehicles-summary">

        <div className="vehicle-summary-card">
          <div className="summary-icon">
            <CarFront size={20} />
          </div>

          <div>
            <span>Total Vehicles</span>
            <strong>{vehicles.length}</strong>
          </div>
        </div>

        <div className="vehicle-summary-card">
          <div className="summary-icon available">
            <CarFront size={20} />
          </div>

          <div>
            <span>Active</span>
            <strong>
              {
                vehicles.filter(
                  (vehicle) =>
                    vehicle.status?.toLowerCase() === "active"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="vehicle-summary-card">
          <div className="summary-icon assigned">
            <UserRound size={20} />
          </div>

          <div>
            <span>Inactive</span>
            <strong>
              {
                vehicles.filter(
                  (vehicle) =>
                    vehicle.status?.toLowerCase() === "inactive"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="vehicle-summary-card">
          <div className="summary-icon maintenance">
            <CircleAlert size={20} />
          </div>

          <div>
            <span>Maintenance</span>
            <strong>
              {
                vehicles.filter(
                  (vehicle) =>
                    vehicle.status?.toLowerCase() ===
                    "maintenance"
                ).length
              }
            </strong>
          </div>
        </div>

      </div>

      {/* Table */}
      <div className="vehicles-table-card">

        <div className="vehicles-table-header">

          <div>
            <h3>Fleet Vehicles</h3>

          <p>
  {searchQuery.trim()
    ? `${filteredVehicles.length} vehicle${
        filteredVehicles.length !== 1 ? "s" : ""
      } found`
    : "View and manage all registered vehicles."}
</p>
          </div>

          <button
            className="refresh-vehicles-button"
            onClick={fetchVehicles}
            disabled={loading}
            title="Refresh vehicles"
          >
            <RefreshCw
              size={17}
              className={loading ? "refresh-spinning" : ""}
            />
          </button>

        </div>

        {loading && (
          <div className="vehicles-state">
            <RefreshCw
              size={24}
              className="state-spinner"
            />

            <p>Loading vehicles...</p>
          </div>
        )}

       {!loading && error && !showForm && (
  <div className="vehicles-state vehicles-error">

            <CircleAlert size={24} />

            <p>{error}</p>

            <button onClick={fetchVehicles}>
              Try Again
            </button>

          </div>
        )}

        {!loading && !error && vehicles.length === 0 && (
          
          <div className="vehicles-state">

            <div className="empty-vehicle-icon">
              <CarFront size={30} />
            </div>

            <h3>No vehicles yet</h3>

            <p>
              Add your first vehicle to start managing your fleet.
            </p>

           <button
  className="empty-add-vehicle-button"
  onClick={() => {
    setError("");
    setShowForm(true);
  }}
>
  <Plus size={17} />
  Add Vehicle
</button>

          </div>
        )}
{!loading &&
  !error &&
  vehicles.length > 0 &&
  filteredVehicles.length === 0 && (
    <div className="vehicles-state">

      <div className="empty-vehicle-icon">
        <CarFront size={30} />
      </div>

      <h3>No matching vehicles</h3>

      <p>
        No vehicles match "{searchQuery}".
      </p>

    </div>
)}
    {!loading &&
  !error &&
  filteredVehicles.length > 0 && (
          <div className="vehicles-table-wrapper">

            <table className="vehicles-table">

              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Registration</th>
                  <th>Category</th>
                  <th>Assigned Driver</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>

                    <td>
                      <div className="vehicle-name-cell">

                        <div className="vehicle-avatar">
                          <CarFront size={18} />
                        </div>

                        <div>
                          <strong>{vehicle.model}</strong>
                          <span>
                            Vehicle #{vehicle.id}
                          </span>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="registration-number">
                        {vehicle.registration_number}
                      </span>
                    </td>

                    <td>
                      {vehicle.categories?.name ? (
                        <span className="category-badge">
                          {vehicle.categories.name}
                        </span>
                      ) : (
                        <span className="muted-text">
                          No category
                        </span>
                      )}
                    </td>

                    <td>
                      {vehicle.drivers?.name ? (
                        <div className="driver-cell">

                          <div className="driver-avatar">
                            <UserRound size={14} />
                          </div>

                          <span>
                            {vehicle.drivers.name}
                          </span>

                        </div>
                      ) : (
                        <span className="unassigned-text">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`vehicle-status ${getStatusClass(
                          vehicle.status
                        )}`}
                      >
                        <span className="status-dot"></span>

                        {vehicle.status || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <span className="created-date">
                        {new Date(
                          vehicle.created_at
                        ).toLocaleDateString()}
                      </span>
                    </td>

<td>
  <div className="vehicle-actions">

    <button
      className="vehicle-action-button edit"
      onClick={() => handleEditVehicle(vehicle)}
      title="Edit vehicle"
    >
      <Pencil size={16} />
    </button>
     <button
    type="button"
    className="vehicle-action-button delete"
  onClick={() => {
  setError("");
  setVehicleToDelete(vehicle);
}}
    title="Delete vehicle"
  >
    <Trash2 size={16} />
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
{vehicleToDelete && (
  <div className="delete-modal-overlay">

    <div className="delete-modal">

      <div className="delete-modal-icon">
        <Trash2 size={22} />
      </div>

      <div className="delete-modal-content">

        <h3>
          {deleteError
            ? "Cannot Delete Vehicle"
            : "Delete Vehicle?"}
        </h3>

        {deleteError ? (

          <p className="delete-modal-error">
            {deleteError}
          </p>

        ) : (

          <>
            <p>
              Are you sure you want to delete{" "}
              <strong>
                {vehicleToDelete.registration_number}
              </strong>
              ?
            </p>

            <span>
              This action cannot be undone.
            </span>
          </>

        )}

      </div>

      <div className="delete-modal-actions">

        {deleteError ? (

          <button
            type="button"
            className="delete-modal-confirm"
            onClick={() => {
              setDeleteError("");
              setVehicleToDelete(null);
            }}
          >
            OK
          </button>

        ) : (

          <>
            <button
              type="button"
              className="delete-modal-cancel"
              onClick={() => {
                setDeleteError("");
                setVehicleToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </button>

            <button
              type="button"
              className="delete-modal-confirm"
              onClick={handleDeleteVehicle}
              disabled={deleting}
            >
              {deleting
                ? "Deleting..."
                : "Delete Vehicle"}
            </button>
          </>

        )}

      </div>

    </div>

  </div>
)}
    </div>
  );
}

export default Vehicles;