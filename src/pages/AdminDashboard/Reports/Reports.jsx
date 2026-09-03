import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  FileText,
  CalendarDays,
  CarFront,
  Route,
  Gauge,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import "./Reports.css";

function Reports({ searchQuery = "" }) {
  const { session } = useAuth();
const [generating, setGenerating] =
  useState(false);
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString();
const filteredReport = (report?.report || []).filter((item) => {
  const query = searchQuery.trim().toLowerCase();

  if (!query) return true;

  const vehicleNumber =
    item.vehicle?.registration_number?.toLowerCase() || "";

  const vehicleModel =
    item.vehicle?.model?.toLowerCase() || "";

  const driverName =
    item.driver?.name?.toLowerCase() || "";

  const categoryName =
    item.category?.name?.toLowerCase() || "";

  return (
    vehicleNumber.includes(query) ||
    vehicleModel.includes(query) ||
    driverName.includes(query) ||
    categoryName.includes(query)
  );
});
const generateReport = async () => {
  if (!session?.access_token) return;

  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      `https://api.margallatravels.com.pk/api/mileage/monthly-report?year=${year}&month=${month}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to generate report"
      );
    }


    setReport(data);

  } catch (error) {
    console.error("Generate report error:", error);

    setError(error.message);
    setReport(null);

  } finally {
    setLoading(false);
  }
};
const handleMonthChange = (value) => {
  setMonth(Number(value));
};

const handleYearChange = (value) => {
  setYear(Number(value));
};
  useEffect(() => {
    if (session?.access_token) {
      generateReport();
    }
  }, [session, year, month]);

const handleDownloadPDF = async () => {
  try {
    setGenerating(true);
    setError("");

    const response = await fetch(
      `https://api.margallatravels.com.pk/api/mileage/monthly-report/pdf?year=${year}&month=${month}`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();

      throw new Error(
        data.message || "Failed to generate PDF"
      );
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `Margalla-Travels-Mileage-Report-${month}-${year}.pdf`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error(
      "Download PDF error:",
      error
    );

    setError(
      error.message ||
        "Failed to generate mileage report"
    );

  } finally {
    setGenerating(false);
  }
};

  return (
    <div className="reports-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="reports-header">

        <div className="reports-heading">

          <div className="reports-heading-icon">
            <FileText size={24} />
          </div>

          <div>
            <h1>Reports</h1>

            <p>
              Generate and view monthly mileage reports
            </p>
          </div>

        </div>

      </div>


      {/* =========================================
          REPORT FILTER
      ========================================= */}

      <div className="reports-filter-card">

        <div className="reports-filter-heading">

          <div className="reports-filter-icon">
            <CalendarDays size={18} />
          </div>

          <div>
            <strong>Generate Mileage Report</strong>

            <span>
              Select the month you want to review
            </span>
          </div>

        </div>


        <div className="reports-filter-controls">

          <select
            value={month}
           onChange={(e) =>
  handleMonthChange(e.target.value)
}
            className="reports-select"
          >
            {monthNames.map((name, index) => (
              <option
                key={index}
                value={index + 1}
              >
                {name}
              </option>
            ))}
          </select>


          <select
            value={year}
          onChange={(e) =>
  handleYearChange(e.target.value)
}
            className="reports-select"
          >
            {Array.from(
              { length: 5 },
              (_, index) =>
                today.getFullYear() - index
            ).map((yearOption) => (
              <option
                key={yearOption}
                value={yearOption}
              >
                {yearOption}
              </option>
            ))}
          </select>


      <button
  className="reports-generate-btn"
  onClick={handleDownloadPDF}
  disabled={generating}
>
  <FileText size={16} />

  {generating
    ? "Generating PDF..."
    : "Generate Report"}
</button>

        </div>
      </div>


      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}


      {/* =========================================
          REPORT CONTENT
      ========================================= */}

      {report && !loading && (

        <>

          {/* =====================================
              REPORT TITLE
          ===================================== */}

          <div className="reports-period">

            <div>
              <h2>
                {monthNames[month - 1]} {year} Mileage Report
              </h2>

              <p>
                Vehicle-wise monthly mileage performance
              </p>
            </div>

          </div>


          {/* =====================================
              SUMMARY CARDS
          ===================================== */}

          <div className="reports-summary-grid">

            <div className="reports-summary-card">

              <div className="reports-summary-icon">
                <CarFront size={21} />
              </div>

              <div>
                <span>Total Vehicles</span>

                <strong>
                  {report.summary?.totalVehicles || 0}
                </strong>

                <p>
                  Vehicles included in report
                </p>
              </div>

            </div>


            <div className="reports-summary-card">

              <div className="reports-summary-icon">
                <Route size={21} />
              </div>

              <div>
                <span>Total KM</span>

                <strong>
                  {formatNumber(
                    report.summary?.totalActual
                  )}
                </strong>

                <p>
                  Actual distance covered
                </p>
              </div>

            </div>


            <div className="reports-summary-card">

              <div className="reports-summary-icon">
                <Gauge size={21} />
              </div>

              <div>
                <span>Expected KM</span>

                <strong>
                  {formatNumber(
                    report.summary?.totalExpected
                  )}
                </strong>

                <p>
                  Expected mileage
                </p>
              </div>

            </div>


            <div className="reports-summary-card">

              <div className="reports-summary-icon">
                <AlertTriangle size={21} />
              </div>

              <div>
                <span>Exceeded Vehicles</span>

                <strong>
                  {report.summary?.exceededVehicles || 0}
                </strong>

                <p>
                  Vehicles above monthly limit
                </p>
              </div>

            </div>

          </div>


          {/* =====================================
              VEHICLE REPORT TABLE
          ===================================== */}

          <div className="reports-table-card">

            <div className="reports-table-header">

              <div>
                <h2>Vehicle Mileage Details</h2>

                <p>
                  Monthly mileage calculation for each vehicle
                </p>
              </div>

             <div className="reports-table-header-actions">



  <div className="reports-vehicle-count">
    {filteredReport.length} vehicles
  </div>

</div>

            </div>


         {!report.report ||
filteredReport.length === 0 ? (

               <div className="reports-empty">

    <FileText size={40} />

    <h3>
      {searchQuery.trim()
        ? "No matching vehicles found"
        : "No mileage data found"}
    </h3>

    <p>
      {searchQuery.trim()
        ? "Try a different vehicle, driver or category."
        : "No mileage records were found for this month."}
    </p>

  </div>

            ) : (

              <div className="reports-table-wrapper">

                <table className="reports-table">

                  <thead>

                    <tr>
                      <th>Vehicle</th>
                      <th>Driver</th>
                      <th>Category</th>
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

            { filteredReport.map((item) => {

                      const actual =
                        Number(
                          item.monthlyActual || 0
                        );

                      const expected =
                        Number(
                          item.monthlyExpected || 0
                        );

                   const difference =
  Number(item.difference || 0);

                      const status =
                        item.status || "on_track";

                      return (
                        <tr
                          key={item.vehicle?.id}
                        >

                          {/* VEHICLE */}

                          <td>

                            <div className="reports-vehicle-cell">

                              <strong>
                                {
                                  item.vehicle
                                    ?.registration_number ||
                                  "—"
                                }
                              </strong>

                              <span>
                                {
                                  item.vehicle?.model ||
                                  "—"
                                }
                              </span>

                            </div>

                          </td>


                          {/* DRIVER */}

                          <td>
                            {item.driver?.name || "—"}
                          </td>


                          {/* CATEGORY */}

                          <td>
                            {item.category?.name || "—"}
                          </td>


                          {/* ACTUAL */}

                          <td>

                            <span className="reports-km-badge">
                              {formatNumber(actual)} km
                            </span>

                          </td>


                          {/* EXPECTED */}

                          <td>
                            {formatNumber(expected)} km
                          </td>


                          {/* LIMIT */}

                          <td>
                            <strong>
                              {formatNumber(
                                item.monthlyLimit
                              )}{" "}
                              km
                            </strong>
                          </td>


                          {/* DIFFERENCE */}

                          <td>

                            <span
                              className={
                                difference > 0
                                  ? "reports-difference reports-difference-warning"
                                  : "reports-difference reports-difference-good"
                              }
                            >

                              {difference > 0
                                ? "+"
                                : ""}

                              {formatNumber(
                                difference
                              )}{" "}
                              km

                            </span>

                          </td>


                          {/* LOCAL */}

                          <td>
                           {item.trips?.local || 0}
                          </td>


                          {/* OUTSTATION */}

                          <td>
                           {item.trips?.outstation || 0}
                          </td>


                          {/* STATUS */}

                          <td>

                            {status === "exceeded" ? (

                              <span className="reports-status reports-status-danger">
                                <AlertTriangle size={14} />
                                Exceeded
                              </span>

                            ) : status === "warning" ? (

                              <span className="reports-status reports-status-warning">
                                <AlertTriangle size={14} />
                                Warning
                              </span>

                            ) : (

                              <span className="reports-status reports-status-success">
                                <CheckCircle size={14} />
                                On Track
                              </span>

                            )}

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </>

      )}

    </div>
  );
}

export default Reports;