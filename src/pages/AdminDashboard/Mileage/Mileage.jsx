import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  Gauge,
  CalendarDays,
  Filter,
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  MapPin,
  Route,
} from "lucide-react";
import "./Mileage.css";
function Mileage({
  filteredVehicleIds = null,
  searchQuery = "",
}) {
  const { session } = useAuth();

  const [monitoring, setMonitoring] = useState([]);
  const [filter, setFilter] = useState("today");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  ====================================================
  FETCH MILEAGE MONITORING
  ====================================================
  */

  useEffect(() => {
    if (session?.access_token) {
      fetchMileageMonitoring();
    }
  }, [session, filter, selectedDate]);

  const fetchMileageMonitoring = async () => {
    try {
      setLoading(true);
      setError("");

      let url =
        "http://localhost:5000/api/mileage/monitoring";

      if (filter === "today") {
        url += "?filter=today";
      }

      if (filter === "month") {
        url += "?filter=month";
      }

      if (filter === "date") {
        url += `?filter=date&date=${selectedDate}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch mileage monitoring"
        );
      }

      setMonitoring(data.monitoring || []);
    } catch (error) {
      console.error(
        "Fetch mileage monitoring error:",
        error
      );

      setError(error.message);
      setMonitoring([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  ====================================================
  FILTER HANDLER
  ====================================================
  */

  const handleFilterChange = (value) => {
    setFilter(value);

    if (value === "date") {
      setSelectedDate(
        new Date()
          .toISOString()
          .split("T")[0]
      );
    }
  };

  /*
  ====================================================
  STATUS
  ====================================================
  */

  const getStatus = (status) => {
    if (status === "exceeded") {
      return {
        label: "Exceeded",
        className:
          "mileage-monitor-status mileage-monitor-status-danger",
        icon: <AlertTriangle size={14} />,
      };
    }

    if (status === "warning") {
      return {
        label: "Warning",
        className:
          "mileage-monitor-status mileage-monitor-status-warning",
        icon: <CircleAlert size={14} />,
      };
    }

    return {
      label: "On Track",
      className:
        "mileage-monitor-status mileage-monitor-status-success",
      icon: <CheckCircle2 size={14} />,
    };
  };

  /*
  ====================================================
  FORMAT NUMBER
  ====================================================
  */

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });

  /*
  ====================================================
  FILTER TITLE
  ====================================================
  */

  const getTableTitle = () => {
    if (filter === "today") {
      return "Today's Mileage";
    }

    if (filter === "month") {
      return "Monthly Mileage";
    }

    return "Mileage for Selected Date";
  };
const normalizedSearch = searchQuery
  .trim()
  .toLowerCase();

const displayedMonitoring = monitoring.filter((item) => {
  // Filter coming from the Alerts panel
  const matchesVehicleFilter =
    !filteredVehicleIds ||
    filteredVehicleIds.includes(item.vehicle?.id);

  // Filter coming from the header search
  const matchesSearch =
    !normalizedSearch ||
    [
      item.vehicle?.registration_number,
      item.vehicle?.model,
      item.driver?.name,
      item.status,
    ].some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(normalizedSearch)
    );

  return matchesVehicleFilter && matchesSearch;
});
  return (
    <div className="mileage-page">

      {/* ================================================
          HEADER
      ================================================= */}

      <div className="mileage-header">

        <div className="mileage-heading">

          <div className="mileage-heading-icon">
            <Gauge size={24} />
          </div>

          <div>
            <h1>Mileage</h1>

            <p>
              Monitor vehicle mileage and usage
            </p>
          </div>

        </div>

      </div>


      {/* ================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mileage-error">
          {error}
        </div>
      )}


      {/* ================================================
          FILTER CARD
      ================================================= */}

      <div className="mileage-filter-card">

        <div className="mileage-filter-heading">

          <div className="mileage-filter-icon">
            <Filter size={18} />
          </div>

          <div>
            <strong>View Mileage</strong>

            <span>
              Choose the mileage period you want to monitor
            </span>
          </div>

        </div>


        <div className="mileage-filter-controls">

          <button
            type="button"
            className={
              filter === "today"
                ? "mileage-filter-btn active"
                : "mileage-filter-btn"
            }
            onClick={() =>
              handleFilterChange("today")
            }
          >
            <CalendarDays size={16} />
            Today
          </button>


          <button
            type="button"
            className={
              filter === "month"
                ? "mileage-filter-btn active"
                : "mileage-filter-btn"
            }
            onClick={() =>
              handleFilterChange("month")
            }
          >
            <Route size={16} />
            This Month
          </button>


          <button
            type="button"
            className={
              filter === "date"
                ? "mileage-filter-btn active"
                : "mileage-filter-btn"
            }
            onClick={() =>
              handleFilterChange("date")
            }
          >
            <CalendarDays size={16} />
            Select Date
          </button>


          {filter === "date" && (
            <input
              type="date"
              value={selectedDate}
              max={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(e) =>
                setSelectedDate(e.target.value)
              }
              className="mileage-date-input"
            />
          )}

        </div>

      </div>


     {/* ================================================
    TABLE
================================================= */}

<div className="mileage-monitor-card">

  <div className="mileage-monitor-header">
<div className="mileage-monitor-heading-content">

  <h2>
    {getTableTitle()}
  </h2>

  <p>
    {filter === "today"
      ? "Vehicle-wise daily mileage performance"
      : "Vehicle-wise monthly mileage performance"}
  </p>

</div>

    <div className="mileage-monitor-count">
     {displayedMonitoring.length} vehicles
    </div>

  </div>


  {loading ? (

    <div className="mileage-loading">
      Loading mileage monitoring...
    </div>

  ) : displayedMonitoring.length === 0 ? (

    <div className="mileage-empty">

      <Gauge size={40} />

   <h3>
  {searchQuery.trim()
    ? "No matching mileage data"
    : "No mileage data found"}
</h3>

<p>
  {searchQuery.trim()
    ? `No mileage records match "${searchQuery}".`
    : "No vehicles are available for mileage monitoring."}
</p>
    </div>

  ) : (

    <div className="mileage-table-wrapper">

      {/*
      =====================================================
      TODAY TABLE
      DO NOT CHANGE THIS TABLE
      =====================================================
      */}

      {filter === "today" ? (

        <table className="mileage-table">

          <thead>

            <tr>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Trip Type</th>

              <th>Today's Actual</th>

              <th>Daily Expected</th>

              <th>Daily Difference</th>

              <th>Monthly Actual</th>

              <th>Monthly Expected</th>

              <th>Monthly Limit</th>

              <th>Monthly Difference</th>

              <th>Trip Summary</th>

              <th>Status</th>
            </tr>

          </thead>


          <tbody>

            {displayedMonitoring.map((item) => {

              const status = getStatus(
                item.status
              );

              const localTrips =
                item.monthlyTrips?.local || 0;

              const outstationTrips =
                item.monthlyTrips?.outstation || 0;

              const selectedLocalTrips =
                item.selectedDayTrips?.local || 0;

              const selectedOutstationTrips =
                item.selectedDayTrips?.outstation || 0;


              let tripType = "—";

              if (
                selectedLocalTrips > 0 &&
                selectedOutstationTrips > 0
              ) {
                tripType = "Local + Outstation";

              } else if (
                selectedLocalTrips > 0
              ) {
                tripType = "Local";

              } else if (
                selectedOutstationTrips > 0
              ) {
                tripType = "Outstation";
              }


              const dailyDifference =
                Number(
                  item.selectedDayDifference || 0
                );

              const monthlyDifference =
                Number(
                  item.monthlyDifference || 0
                );


              return (

                <tr key={item.vehicle.id}>

                  {/* VEHICLE */}

                  <td>

                    <div className="mileage-vehicle-cell">

                      <strong>
                        {item.vehicle.registration_number}
                      </strong>

                      <span>
                        {item.vehicle.model}
                      </span>

                    </div>

                  </td>


                  {/* DRIVER */}

                  <td>
                    {item.driver?.name || "—"}
                  </td>


                  {/* TRIP TYPE */}

                  <td>

                    <span className="mileage-trip-type">
                      {tripType}
                    </span>

                  </td>


                  {/* TODAY ACTUAL */}

                  <td>

                    <span className="mileage-km">

                      {formatNumber(
                        item.selectedDayKm
                      )}{" "}
                      km

                    </span>

                  </td>


                  {/* DAILY EXPECTED */}

                  <td>

                    {formatNumber(
                      item.dailyExpected
                    )}{" "}
                    km

                  </td>


                  {/* DAILY DIFFERENCE */}

                  <td>

                    <span
                      className={
                        dailyDifference > 0
                          ? "mileage-difference mileage-difference-warning"
                          : "mileage-difference mileage-difference-good"
                      }
                    >

                      {dailyDifference > 0
                        ? "+"
                        : ""}

                      {formatNumber(
                        dailyDifference
                      )}{" "}
                      km

                    </span>

                  </td>


                  {/* MONTHLY ACTUAL */}

                  <td>

                    {formatNumber(
                      item.monthlyActual
                    )}{" "}
                    km

                  </td>


                  {/* MONTHLY EXPECTED */}

                  <td>

                    {formatNumber(
                      item.monthlyExpected
                    )}{" "}
                    km

                  </td>


                  {/* MONTHLY LIMIT */}

                  <td>

                    <strong className="mileage-limit-value">

                      {formatNumber(
                        item.monthlyLimit
                      )}{" "}
                      km

                    </strong>

                  </td>


                  {/* MONTHLY DIFFERENCE */}

                  <td>

                    <span
                      className={
                        monthlyDifference > 0
                          ? "mileage-difference mileage-difference-warning"
                          : "mileage-difference mileage-difference-good"
                      }
                    >

                      {monthlyDifference > 0
                        ? "+"
                        : ""}

                      {formatNumber(
                        monthlyDifference
                      )}{" "}
                      km

                    </span>

                  </td>


                  {/* TRIP SUMMARY */}

                  <td>

                    <div className="mileage-trip-summary">

                      <span>
                        <MapPin size={13} />
                        Local: {localTrips}
                      </span>

                      <span>
                        <Route size={13} />
                        Outstation: {outstationTrips}
                      </span>

                    </div>

                  </td>


                  {/* STATUS */}

                  <td>

                    <span
                      className={
                        status.className
                      }
                    >

                      {status.icon}

                      {status.label}

                    </span>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>


      ) : (


        /*
        =====================================================
        MONTHLY TABLE
        =====================================================
        */

        <table className="mileage-table mileage-monthly-table">

          <thead>

            <tr>

              <th>Vehicle</th>

              <th>Driver</th>

              <th>Monthly Actual</th>

              <th>Monthly Expected</th>

              <th>Monthly Limit</th>

              <th>Difference</th>

              <th>Local Trips</th>

              <th>Outstation Trips</th>

              <th>Status</th>

            </tr>

          </thead>


          <tbody>

        {displayedMonitoring.map((item) => {

              const status = getStatus(
                item.status
              );

              const monthlyActual =
                Number(
                  item.monthlyActual || 0
                );

              const monthlyExpected =
                Number(
                  item.monthlyExpected || 0
                );

              const monthlyLimit =
                Number(
                  item.monthlyLimit || 0
                );

              /*
              Difference between actual
              and expected mileage
              */

              const monthlyDifference =
                Number(
                  (
                    monthlyActual -
                    monthlyExpected
                  ).toFixed(2)
                );


              const localTrips =
                item.monthlyTrips?.local || 0;

              const outstationTrips =
                item.monthlyTrips?.outstation || 0;


              return (

                <tr key={item.vehicle.id}>

                  {/* VEHICLE */}

                  <td>

                    <div className="mileage-vehicle-cell">

                      <strong>
                        {item.vehicle.registration_number}
                      </strong>

                      <span>
                        {item.vehicle.model}
                      </span>

                    </div>

                  </td>


                  {/* DRIVER */}

                  <td>
                    {item.driver?.name || "—"}
                  </td>


                  {/* MONTHLY ACTUAL */}

                  <td>

                    <span className="mileage-km">

                      {formatNumber(
                        monthlyActual
                      )}{" "}
                      km

                    </span>

                  </td>


                  {/* MONTHLY EXPECTED */}

                  <td>

                    {formatNumber(
                      monthlyExpected
                    )}{" "}
                    km

                  </td>


                  {/* MONTHLY LIMIT */}

                  <td>

                    <strong className="mileage-limit-value">

                      {formatNumber(
                        monthlyLimit
                      )}{" "}
                      km

                    </strong>

                  </td>


                  {/* DIFFERENCE */}

                  <td>

                    <span
                      className={
                        monthlyDifference > 0
                          ? "mileage-difference mileage-difference-warning"
                          : "mileage-difference mileage-difference-good"
                      }
                    >

                      {monthlyDifference > 0
                        ? "+"
                        : ""}

                      {formatNumber(
                        monthlyDifference
                      )}{" "}
                      km

                    </span>

                  </td>


                  {/* LOCAL TRIPS */}

                  <td>

                    <span className="mileage-trip-count">

                      <MapPin size={14} />

                      {localTrips}

                    </span>

                  </td>


                  {/* OUTSTATION TRIPS */}

                  <td>

                    <span className="mileage-trip-count">

                      <Route size={14} />

                      {outstationTrips}

                    </span>

                  </td>


                  {/* STATUS */}

                  <td>

                    <span
                      className={
                        status.className
                      }
                    >

                      {status.icon}

                      {status.label}

                    </span>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      )}

    </div>

  )}

</div>


{/* ================================================
    LEGEND
================================================= */}

<div className="mileage-legend">

  <div className="mileage-legend-item">

    <span className="legend-dot success"></span>

    <span>
      On Track
    </span>

  </div>


  <div className="mileage-legend-item">

    <span className="legend-dot warning"></span>

    <span>
      Warning — usage is above expected pace
    </span>

  </div>


  <div className="mileage-legend-item">

    <span className="legend-dot danger"></span>

    <span>
      Exceeded — monthly limit crossed
    </span>

  </div>

</div>
</div>
  )
}


  export default Mileage;