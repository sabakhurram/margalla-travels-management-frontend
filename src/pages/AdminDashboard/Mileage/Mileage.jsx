import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  Gauge,
  ClipboardList,
  Route,
  CalendarDays,
    AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Mileage.css";

function Mileage() {
    const [chartData, setChartData] = useState([]);
    const prepareChartData = (entries) => {
  const lastSevenDays = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();

    date.setDate(date.getDate() - i);

    const dateString = date
      .toISOString()
      .split("T")[0];

    const totalKm = entries
      .filter((entry) => entry.entry_date === dateString)
      .reduce(
        (total, entry) =>
          total + Number(entry.km_covered || 0),
        0
      );

    lastSevenDays.push({
      date: dateString,
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      km: totalKm,
    });
  }

  return lastSevenDays;
};
  const { session } = useAuth();

  const [mileage, setMileage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.access_token) {
      fetchMileage();
    }
  }, [session]);

  const fetchMileage = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/mileage",
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch mileage"
        );
      }
const entries = data.mileage || [];

setMileage(entries);
setChartData(prepareChartData(entries));
    } catch (error) {
      console.error("Fetch mileage error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mileage-page">

      {/* ================= HEADER ================= */}

      <div className="mileage-header">

        <div className="mileage-heading">

          <div className="mileage-heading-icon">
            <Gauge size={24} />
          </div>

          <div>
            <h1>Mileage</h1>

            <p>
              Monitor vehicle mileage and daily usage
            </p>
          </div>

        </div>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mileage-error">
          {error}
        </div>
      )}

    {/* ================= SUMMARY ================= */}

<div className="mileage-summary-grid">

  {/* Total Entries */}
  <div className="mileage-summary-card">
    <div className="mileage-summary-icon">
      <ClipboardList size={21} />
    </div>

    <div className="mileage-summary-content">
      <span>Total Entries</span>

      <strong>
        {mileage.length}
      </strong>

      <p>Recorded mileage entries</p>
    </div>
  </div>


  {/* Total KM */}
  <div className="mileage-summary-card">
    <div className="mileage-summary-icon">
      <Route size={21} />
    </div>

    <div className="mileage-summary-content">
      <span>Total KM</span>

      <strong>
        {mileage
          .reduce(
            (total, entry) =>
              total + Number(entry.km_covered || 0),
            0
          )
          .toLocaleString()}
      </strong>

      <p>Distance covered</p>
    </div>
  </div>


  {/* Today's KM */}
  <div className="mileage-summary-card">
    <div className="mileage-summary-icon">
      <CalendarDays size={21} />
    </div>

    <div className="mileage-summary-content">
      <span>Today's KM</span>

      <strong>
        {mileage
          .filter(
            (entry) =>
              entry.entry_date ===
              new Date().toISOString().split("T")[0]
          )
          .reduce(
            (total, entry) =>
              total + Number(entry.km_covered || 0),
            0
          )
          .toLocaleString()}
      </strong>

      <p>Distance covered today</p>
    </div>
  </div>

</div>
{/* ================= MILEAGE CHART ================= */}

{!loading && !error && (
  <div className="mileage-chart-card">

    <div className="mileage-chart-header">

      <div>
        <h2>Mileage Overview</h2>

        <p>
          Total kilometers covered over the last 7 days
        </p>
      </div>

    </div>

    <div className="mileage-chart">

      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >

          <CartesianGrid
            stroke="#edf1f5"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#718096",
              fontSize: 12,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#718096",
              fontSize: 12,
            }}
            allowDecimals={false}
          />

          <Tooltip
            contentStyle={{
              border: "1px solid #e5eaf0",
              borderRadius: "8px",
              boxShadow:
                "0 4px 12px rgba(23, 50, 77, 0.08)",
            }}
            formatter={(value) => [
              `${Number(value).toLocaleString()} km`,
              "Mileage",
            ]}
          />

          <Line
            type="monotone"
            dataKey="km"
            stroke="#0797a8"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: "#0797a8",
            }}
            activeDot={{
              r: 6,
            }}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>

  </div>
)}
      {/* ================= TABLE ================= */}

      <div className="mileage-table-card">

        {loading ? (
          <div className="mileage-loading">
            Loading mileage...
          </div>
        ) : mileage.length === 0 ? (
          <div className="mileage-empty">

            <Gauge size={40} />

            <h3>No mileage entries found</h3>

            <p>
              Mileage records submitted by drivers
              will appear here.
            </p>

          </div>
        ) : (
          <div className="mileage-table-wrapper">

            <table className="mileage-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Starting</th>
                  <th>Ending</th>
                  <th>KM Covered</th>
                  <th>Trip Type</th>
                  <th>Monthly Status</th>
                </tr>
              </thead>

              <tbody>

                {mileage.map((entry) => (

                  <tr key={entry.id}>

                    {/* DATE */}

                    <td>
                      {new Date(
                        `${entry.entry_date}T00:00:00`
                      ).toLocaleDateString()}
                    </td>

                    {/* VEHICLE */}

                    <td>
                      <div className="mileage-vehicle-cell">

                        <strong>
                          {entry.vehicles
                            ?.registration_number ||
                            "—"}
                        </strong>

                        {entry.vehicles?.model && (
                          <span>
                            {entry.vehicles.model}
                          </span>
                        )}

                      </div>
                    </td>

                    {/* DRIVER */}

                    <td>
                      {entry.drivers?.name || "—"}
                    </td>

                    {/* STARTING */}

                    <td>
                      {Number(
                        entry.starting_mileage
                      ).toLocaleString()}
                    </td>

                    {/* ENDING */}

                    <td>
                      {Number(
                        entry.ending_mileage
                      ).toLocaleString()}
                    </td>

                    {/* KM COVERED */}

                    <td>
                      <span className="mileage-km">
                        {Number(
                          entry.km_covered || 0
                        ).toLocaleString()}{" "}
                        km
                      </span>
                    </td>

                    {/* TRIP TYPE */}

                    <td>
                      <span className="mileage-trip-type">
                        {entry.trip_type}
                      </span>
                    </td>

                    {/* REMARKS */}

                    {/* MONTHLY STATUS */}

<td>
  {entry.isLatestEntry ? (
    entry.monthlyStatus?.overLimit > 0 ? (
      <span className="mileage-limit-warning">
        <AlertTriangle size={14} />
        <span>
          {Number(
            entry.monthlyStatus.overLimit
          ).toLocaleString()}{" "}
          KM over limit
        </span>
      </span>
    ) : (
      <span className="mileage-limit-remaining">
        {Number(
          entry.monthlyStatus?.remaining || 0
        ).toLocaleString()}{" "}
        KM remaining
      </span>
    )
  ) : (
    <span className="mileage-status-placeholder">
       No limit
    </span>
  )}

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

export default Mileage;