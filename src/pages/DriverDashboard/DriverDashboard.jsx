import { useEffect, useState } from "react";
import {
  CarFront,
  Gauge,
  Route,
  CalendarDays,
  LogOut,
  UserRound,
  CircleCheck,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./DriverDashboard.css";

function DriverDashboard() {
  const { session, logout } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mileage form
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [startingMileage, setStartingMileage] = useState("");
  const [endingMileage, setEndingMileage] = useState("");
  const [tripType, setTripType] = useState("official");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (session?.access_token) {
      fetchDashboard();
    }
  }, [session]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/mileage/my-dashboard",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch dashboard data"
        );
      }

      setDashboardData(data);
    } catch (error) {
      console.error(
        "Fetch driver dashboard error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateKm = () => {
    if (
      startingMileage === "" ||
      endingMileage === ""
    ) {
      return 0;
    }

    const start = Number(startingMileage);
    const end = Number(endingMileage);

    if (end < start) {
      return 0;
    }

    return end - start;
  };

  const kmCovered = calculateKm();

  if (loading) {
    return (
      <div className="driver-dashboard-loading">
        Loading driver dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="driver-dashboard-error">
        <AlertCircle size={22} />
        <span>{error}</span>
      </div>
    );
  }

  const driver = dashboardData?.driver;
  const vehicle = dashboardData?.vehicle;
  const monthlyMileage =
    dashboardData?.monthlyMileage;

  return (
    <div className="driver-dashboard">

      {/* Header */}
      <div className="driver-dashboard-header">

       <div className="driver-welcome">
  <div className="driver-welcome-icon">
    <UserRound size={24} />
  </div>

  <div className="driver-welcome-text">
    <h1>Welcome back, {driver?.name}</h1>
    <p>Manage your vehicle mileage and trip records</p>
  </div>
</div>

        <button
          className="driver-logout-btn"
          onClick={logout}
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>


      {/* Vehicle + Monthly Summary */}
      <div className="driver-summary-grid">

        {/* Assigned Vehicle */}
        <div className="driver-card">

          <div className="driver-card-header">
            <div className="driver-card-icon">
              <CarFront size={22} />
            </div>

            <div>
              <h2>Assigned Vehicle</h2>
              <p>Your current vehicle assignment</p>
            </div>
          </div>

          {vehicle ? (
            <div className="vehicle-details">

              <div className="vehicle-main">
                <strong>
                  {vehicle.registration_number}
                </strong>

                <span
                  className={`vehicle-status ${vehicle.status}`}
                >
                  <CircleCheck size={14} />
                  {vehicle.status}
                </span>
              </div>

              <p className="vehicle-model">
                {vehicle.model}
              </p>

              <p className="vehicle-category">
                Category:{" "}
                <strong>
                  {vehicle.categories?.name ||
                    "Not assigned"}
                </strong>
              </p>

            </div>
          ) : (
            <div className="no-vehicle">
              No vehicle is currently assigned to you.
            </div>
          )}

        </div>


        {/* Monthly Mileage */}
        <div className="driver-card">

          <div className="driver-card-header">
            <div className="driver-card-icon">
              <Gauge size={22} />
            </div>

            <div>
              <h2>Monthly Mileage</h2>
              <p>
                Your mileage usage for this month
              </p>
            </div>
          </div>

          {monthlyMileage && (
            <div className="mileage-summary">

              <div className="mileage-number">
                <strong>
                  {monthlyMileage.used.toLocaleString()}
                </strong>

                <span>
                  /{" "}
                  {monthlyMileage.limit.toLocaleString()}{" "}
                  KM
                </span>
              </div>

              <div className="mileage-progress">
                <div
                  className="mileage-progress-fill"
                  style={{
                    width: `${Math.min(
                      monthlyMileage.percentage,
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="mileage-stats">

                <div>
                  <span>Used</span>
                  <strong>
                    {monthlyMileage.used.toLocaleString()} KM
                  </strong>
                </div>

                <div>
                  <span>Remaining</span>
                  <strong>
                    {monthlyMileage.remaining.toLocaleString()} KM
                  </strong>
                </div>

                <div>
                  <span>Limit</span>
                  <strong>
                    {monthlyMileage.limit.toLocaleString()} KM
                  </strong>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>


      {/* Record Mileage */}
      <div className="driver-mileage-card">

        <div className="driver-section-heading">

          <div className="driver-section-icon">
            <Route size={24} />
          </div>

          <div>
            <h2>Record Mileage</h2>
            <p>
              Enter the mileage details for your trip
            </p>
          </div>

        </div>


        <div className="mileage-form">

          {/* Date */}
          <div className="form-group">

            <label>
              <CalendarDays size={16} />
              Entry Date
            </label>

            <input
              type="date"
              value={entryDate}
              onChange={(e) =>
                setEntryDate(e.target.value)
              }
            />

          </div>


          {/* Trip Type */}
          <div className="form-group">

            <label>
              Trip Type
            </label>

            <select
              value={tripType}
              onChange={(e) =>
                setTripType(e.target.value)
              }
            >
              <option value="official">
                Official
              </option>

              <option value="personal">
                Personal
              </option>
            </select>

          </div>


          {/* Starting Mileage */}
          <div className="form-group">

            <label>
              Starting Mileage (KM)
            </label>

            <input
              type="number"
              min="0"
              placeholder="e.g. 45200"
              value={startingMileage}
              onChange={(e) =>
                setStartingMileage(e.target.value)
              }
            />

          </div>


          {/* Ending Mileage */}
          <div className="form-group">

            <label>
              Ending Mileage (KM)
            </label>

            <input
              type="number"
              min="0"
              placeholder="e.g. 45275"
              value={endingMileage}
              onChange={(e) =>
                setEndingMileage(e.target.value)
              }
            />

          </div>


          {/* Automatically Calculated KM */}
          <div className="mileage-calculated">

            <span>KM Covered</span>

            <strong>
              {kmCovered.toLocaleString()} KM
            </strong>

          </div>


          {/* Remarks */}
          <div className="form-group form-group-full">

            <label>
              Remarks
            </label>

            <textarea
              rows="3"
              placeholder="Add any notes about this trip..."
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
            />

          </div>


          <div className="mileage-form-actions">

            <button
              type="button"
              className="mileage-submit-btn"
              disabled={!vehicle}
            >
              <Route size={18} />
              Submit Mileage
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DriverDashboard;