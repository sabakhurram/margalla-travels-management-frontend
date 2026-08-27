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
  ClipboardList,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./DriverDashboard.css";

function DriverDashboard() {
  const { session, logout } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // General dashboard error
  const [error, setError] = useState("");

  // Mileage-specific error
  const [mileageError, setMileageError] = useState("");

  const [mileageHistory, setMileageHistory] = useState([]);

  // Controls the success screen immediately after submission
  const [mileageSuccess, setMileageSuccess] = useState(null);

  // Prevent multiple submissions
  const [submittingMileage, setSubmittingMileage] = useState(false);

  /*
  ====================================================
  PAKISTAN DATE
  ====================================================
  */

  const getPakistanDate = () => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  };

  /*
  ====================================================
  TODAY'S DATE
  ====================================================
  */

  const todayPakistan = getPakistanDate();

  /*
  ====================================================
  CHECK WHETHER TODAY'S MILEAGE WAS SUBMITTED
  ====================================================
  */

  const todaySubmitted = mileageHistory.some(
    (entry) => entry.entry_date === todayPakistan
  );

  /*
  ====================================================
  MILEAGE FORM
  ====================================================
  */

  const [entryDate, setEntryDate] = useState(
    getPakistanDate()
  );

  const [startingMileage, setStartingMileage] =
    useState("");

  const [endingMileage, setEndingMileage] =
    useState("");

  const [tripType, setTripType] =
    useState("local");

  /*
  ====================================================
  FETCH DASHBOARD
  ====================================================
  */

  useEffect(() => {
    if (session?.access_token) {
      fetchDashboard();
    }
  }, [session]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      /*
      --------------------------------------------
      Dashboard
      --------------------------------------------
      */

      const response = await fetch(
        "http://localhost:5000/api/mileage/my-dashboard",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "Driver dashboard data:",
        data
      );

      /*
      --------------------------------------------
      Mileage history
      --------------------------------------------
      */

      const historyResponse = await fetch(
        "http://localhost:5000/api/mileage/my-history",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const historyData =
        await historyResponse.json();

      console.log(
        "Driver mileage history:",
        historyData
      );

      const history =
        historyData.mileage || [];

      setMileageHistory(history);

      /*
      --------------------------------------------
      Check dashboard request
      --------------------------------------------
      */

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch dashboard data"
        );
      }

      /*
      --------------------------------------------
      Save dashboard data
      --------------------------------------------
      */

      setDashboardData(data);

      /*
      --------------------------------------------
      Set starting odometer
      --------------------------------------------
      */

      setStartingMileage(
        data.startingOdometer !== null &&
          data.startingOdometer !== undefined
          ? String(data.startingOdometer)
          : ""
      );

    } catch (error) {
      console.error(
        "Fetch driver dashboard error:",
        error
      );

      setError(
        error.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ====================================================
  CALCULATE KM
  ====================================================
  */

  const calculateKm = () => {
    if (
      startingMileage === "" ||
      endingMileage === ""
    ) {
      return 0;
    }

    const start =
      Number(startingMileage);

    const end =
      Number(endingMileage);

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end < start
    ) {
      return 0;
    }

    return end - start;
  };

  const kmCovered = calculateKm();

  /*
  ====================================================
  SUBMIT MILEAGE
  ====================================================
  */

  const handleMileageSubmit = async (e) => {
    e.preventDefault();

    setMileageError("");

    /*
    --------------------------------------------
    Vehicle validation
    --------------------------------------------
    */

    if (!vehicle) {
      setMileageError(
        "No vehicle is currently assigned to you."
      );

      return;
    }

    /*
    --------------------------------------------
    Starting mileage validation
    --------------------------------------------
    */

    if (startingMileage === "") {
      setMileageError(
        "Starting odometer is required."
      );

      return;
    }

    /*
    --------------------------------------------
    Ending mileage validation
    --------------------------------------------
    */

    if (endingMileage === "") {
      setMileageError(
        "Ending odometer is required."
      );

      return;
    }

    /*
    --------------------------------------------
    Ending mileage validation
    --------------------------------------------
    */

    if (
      Number(endingMileage) <
      Number(startingMileage)
    ) {
      setMileageError(
        "Ending odometer cannot be less than starting odometer."
      );

      return;
    }

    try {
      setSubmittingMileage(true);

      const response = await fetch(
        "http://localhost:5000/api/mileage",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            entry_date: entryDate,

            starting_mileage:
              startingMileage,

            ending_mileage:
              endingMileage,

            trip_type:
              tripType,
          }),
        }
      );

      const result =
        await response.json();

      console.log(
        "Mileage submission response:",
        result
      );

      /*
      --------------------------------------------
      Backend error
      --------------------------------------------
      */

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to submit mileage"
        );
      }

      /*
      --------------------------------------------
      Store submitted values BEFORE clearing them
      --------------------------------------------
      */

      const submittedStart =
        Number(startingMileage);

      const submittedEnd =
        Number(endingMileage);

      const submittedKm =
        submittedEnd -
        submittedStart;

      /*
      --------------------------------------------
      Show success screen
      --------------------------------------------
      */

      setMileageSuccess({
        entryDate: entryDate,

        startingMileage:
          submittedStart,

        endingMileage:
          submittedEnd,

        kmCovered:
          submittedKm,
      });

      /*
      --------------------------------------------
      Clear form values
      --------------------------------------------
      */

      setStartingMileage("");
      setEndingMileage("");

      setMileageError("");

      /*
      --------------------------------------------
      Refresh dashboard/history
      --------------------------------------------
      */

      await fetchDashboard();

    } catch (error) {
      console.error(
        "Submit mileage error:",
        error
      );

      /*
      IMPORTANT:
      This error stays INSIDE the dashboard.
      */

      setMileageError(
        error.message ||
          "Failed to submit mileage"
      );

    } finally {
      setSubmittingMileage(false);
    }
  };

  /*
  ====================================================
  LOADING SCREEN
  ====================================================
  */

  if (loading) {
    return (
      <div className="driver-dashboard-loading">
        Loading driver dashboard...
      </div>
    );
  }

  /*
  ====================================================
  DASHBOARD ERROR
  ====================================================
  */

  if (error) {
    return (
      <div className="driver-dashboard-error">
        <AlertCircle size={22} />

        <span>{error}</span>

        <button
          type="button"
          onClick={fetchDashboard}
        >
          Try Again
        </button>
      </div>
    );
  }

  /*
  ====================================================
  DATA
  ====================================================
  */

  const driver =
    dashboardData?.driver;

  const vehicle =
    dashboardData?.vehicle;

  const monthlyMileage =
    dashboardData?.monthlyMileage;

  /*
  ====================================================
  RENDER
  ====================================================
  */

  return (
    <div className="driver-dashboard">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="driver-dashboard-header">

        <div className="driver-welcome">

          <div className="driver-welcome-icon">
            <UserRound size={24} />
          </div>

          <div className="driver-welcome-text">

            <h1>
              Welcome back,{" "}
              {driver?.name}
            </h1>

            <p>
              Manage your vehicle mileage
              and trip records
            </p>

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


      {/* ==================================================
          VEHICLE + MONTHLY SUMMARY
      ================================================== */}

      <div className="driver-summary-grid">

        {/* Assigned Vehicle */}

        <div className="driver-card">

          <div className="driver-card-header">

            <div className="driver-card-icon">
              <CarFront size={22} />
            </div>

            <div>

              <h2>
                Assigned Vehicle
              </h2>

              <p>
                Your current vehicle
                assignment
              </p>

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
              No vehicle is currently
              assigned to you.
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

              <h2>
                Monthly Mileage
              </h2>

              <p>
                Your mileage usage for
                this month
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
                  /
                  {" "}
                  {monthlyMileage.limit.toLocaleString()}
                  {" "}
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

                  <span>
                    Used
                  </span>

                  <strong>
                    {monthlyMileage.used.toLocaleString()}
                    {" "}
                    KM
                  </strong>

                </div>


                <div>

                  <span>
                    Remaining
                  </span>

                  <strong>
                    {monthlyMileage.remaining.toLocaleString()}
                    {" "}
                    KM
                  </strong>

                </div>


                <div>

                  <span>
                    Limit
                  </span>

                  <strong>
                    {monthlyMileage.limit.toLocaleString()}
                    {" "}
                    KM
                  </strong>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* ==================================================
          RECORD MILEAGE / SUCCESS
      ================================================== */}

      {mileageSuccess || todaySubmitted ? (

        /*
        ====================================================
        SUCCESS CARD
        ====================================================
        */

        <div className="mileage-success-card">

          <div className="mileage-success-icon">
            <CircleCheck size={30} />
          </div>

          <h2>
            Mileage Submitted Successfully
          </h2>

          <p>
            Today's mileage has already
            been recorded.
          </p>


          {mileageSuccess && (

            <div className="mileage-success-details">

              <div className="mileage-success-detail">

                <span>
                  Starting Odometer
                </span>

                <strong>
                  {mileageSuccess.startingMileage.toLocaleString()}
                  {" "}
                  KM
                </strong>

              </div>


              <div className="mileage-success-detail">

                <span>
                  Ending Odometer
                </span>

                <strong>
                  {mileageSuccess.endingMileage.toLocaleString()}
                  {" "}
                  KM
                </strong>

              </div>


              <div className="mileage-success-detail">

                <span>
                  KM Covered
                </span>

                <strong>
                  {mileageSuccess.kmCovered.toLocaleString()}
                  {" "}
                  KM
                </strong>

              </div>

            </div>

          )}

        </div>

      ) : (

        /*
        ====================================================
        RECORD MILEAGE FORM
        ====================================================
        */

        <div className="driver-mileage-card">

          <div className="driver-section-heading">

            <div className="driver-section-icon">
              <Route size={24} />
            </div>

            <div>

              <h2>
                Record Mileage
              </h2>

              <p>
                Enter the mileage details
                for your trip
              </p>

            </div>

          </div>


          <div className="mileage-form">

            {/* ==================================================
                MILEAGE ERROR
            ================================================== */}

            {mileageError && (

              <div className="mileage-form-error">

                <AlertCircle size={18} />

                <div>

                  <strong>
                    Unable to submit mileage
                  </strong>

                  <p>
                    {mileageError}
                  </p>

                </div>

              </div>

            )}


            {/* ==================================================
                DATE
            ================================================== */}

            <div className="form-group">

              <label>

                <CalendarDays size={16} />

                Entry Date

              </label>


              <input
                type="date"
                value={entryDate}
                onChange={(e) =>
                  setEntryDate(
                    e.target.value
                  )
                }
              />

            </div>


            {/* ==================================================
                TRIP TYPE
            ================================================== */}

            <div className="form-group">

              <label>
                Trip Type
              </label>


              <select
                value={tripType}
                onChange={(e) =>
                  setTripType(
                    e.target.value
                  )
                }
              >

                <option value="local">
                  Local
                </option>

                <option value="outstation">
                  Outstation
                </option>

              </select>

            </div>


            {/* ==================================================
                STARTING MILEAGE
            ================================================== */}

            <div className="form-group">

              <label>
                Starting Odometer (KM)
              </label>


              <input
                type="number"
                min="0"
                placeholder="Enter starting odometer"
                value={startingMileage}
                onChange={(e) =>
                  setStartingMileage(
                    e.target.value
                  )
                }
                readOnly={
                  dashboardData?.startingOdometer !==
                    null &&
                  dashboardData?.startingOdometer !==
                    undefined
                }
              />

            </div>


            {/* ==================================================
                ENDING MILEAGE
            ================================================== */}

            <div className="form-group">

              <label>
                Ending Odometer (KM)
              </label>


              <input
                type="number"
                min="0"
                placeholder="Enter ending odometer"
                value={endingMileage}
                onChange={(e) =>
                  setEndingMileage(
                    e.target.value
                  )
                }
              />

            </div>


            {/* ==================================================
                CALCULATED KM
            ================================================== */}

            <div className="mileage-calculated">

              <span>
                KM Covered
              </span>

              <strong>
                {kmCovered.toLocaleString()}
                {" "}
                KM
              </strong>

            </div>


            {/* ==================================================
                SUBMIT BUTTON
            ================================================== */}

            <div className="mileage-form-actions">

              <button
                type="button"
                className="mileage-submit-btn"
                disabled={
                  !vehicle ||
                  submittingMileage ||
                  startingMileage === "" ||
                  endingMileage === ""
                }
                onClick={
                  handleMileageSubmit
                }
              >

                <Route size={18} />

                {submittingMileage
                  ? "Submitting..."
                  : "Submit Mileage"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* ==================================================
          MILEAGE HISTORY
      ================================================== */}

      <div className="driver-mileage-card">

        <div className="driver-section-heading">

          <div className="driver-section-icon">
            <ClipboardList size={24} />
          </div>

          <div>

            <h2>
              Mileage History
            </h2>

            <p>
              Your previously submitted
              mileage records
            </p>

          </div>

        </div>


        {mileageHistory.length === 0 ? (

          <div className="no-mileage-history">

            No mileage records found.

          </div>

        ) : (

          <div className="mileage-history-table-wrapper">

            <table className="mileage-history-table">

              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Starting Odometer
                  </th>

                  <th>
                    Ending Odometer
                  </th>

                  <th>
                    KM Covered
                  </th>

                  <th>
                    Trip Type
                  </th>

                </tr>

              </thead>


              <tbody>

                {mileageHistory.map(
                  (entry) => (

                    <tr key={entry.id}>

                      <td>

                        {new Date(
                          `${entry.entry_date}T00:00:00`
                        ).toLocaleDateString(
                          "en-PK",
                          {
                            timeZone:
                              "Asia/Karachi",

                            day: "2-digit",

                            month: "2-digit",

                            year: "numeric",
                          }
                        )}

                      </td>


                      <td>

                        {Number(
                          entry.starting_mileage
                        ).toLocaleString()}
                        {" "}
                        KM

                      </td>


                      <td>

                        {Number(
                          entry.ending_mileage
                        ).toLocaleString()}
                        {" "}
                        KM

                      </td>


                      <td>

                        {Number(
                          entry.km_covered
                        ).toLocaleString()}
                        {" "}
                        KM

                      </td>


                      <td>

                        <span
                          className={`trip-type ${entry.trip_type}`}
                        >

                          {entry.trip_type}

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default DriverDashboard;