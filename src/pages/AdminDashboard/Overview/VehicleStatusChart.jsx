import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import "./VehicleStatusChart.css";

function VehicleStatusChart({
  data = {},
  loading = false,
}) {
  const chartData = [
    {
      name: "Active",
      value: Number(data.active || 0),
      key: "active",
    },
    {
      name: "Maintenance",
      value: Number(
        data.maintenance || 0
      ),
      key: "maintenance",
    },
    {
      name: "Inactive",
      value: Number(
        data.inactive || 0
      ),
      key: "inactive",
    },
  ];

  const totalVehicles =
    chartData.reduce(
      (total, item) =>
        total + item.value,
      0
    );

  const getStatusColor = (key) => {
    if (key === "active") {
      return "#0797a8";
    }

    if (key === "maintenance") {
      return "#e6a23c";
    }

    return "#a8b2bd";
  };

  return (
    <section className="vehicle-status-card">

      <div className="vehicle-status-header">

        <div>
          <h3>
            Vehicle Status
          </h3>

          <p>
            Current fleet availability
          </p>
        </div>

        <span className="vehicle-status-period">
          Current
        </span>

      </div>

      <div className="vehicle-status-chart">

        {loading ? (

          <div className="vehicle-status-empty">
            Loading vehicle status...
          </div>

        ) : totalVehicles === 0 ? (

          <div className="vehicle-status-empty">
            No vehicles found.
          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={3}
                strokeWidth={0}
              >

                {chartData.map(
                  (entry) => (
                    <Cell
                      key={entry.key}
                      fill={getStatusColor(
                        entry.key
                      )}
                    />
                  )
                )}

              </Pie>

              <Tooltip
                contentStyle={{
                  border:
                    "1px solid #e8edf2",
                  borderRadius: "8px",
                  boxShadow:
                    "0 4px 15px rgba(30, 55, 80, 0.08)",
                  fontSize: "10px",
                }}
              />

            </PieChart>
          </ResponsiveContainer>

        )}

        {!loading &&
          totalVehicles > 0 && (
            <div className="vehicle-status-center">

              <strong>
                {totalVehicles}
              </strong>

              <span>
                Vehicles
              </span>

            </div>
          )}

      </div>

      <div className="vehicle-status-legend">

        {chartData.map((item) => {

          const percentage =
            totalVehicles > 0
              ? Math.round(
                  (item.value /
                    totalVehicles) *
                    100
                )
              : 0;

          return (
            <div
              className="vehicle-status-legend-item"
              key={item.key}
            >

              <div className="vehicle-status-legend-left">

                <span
                  className="vehicle-status-dot"
                  style={{
                    background:
                      getStatusColor(
                        item.key
                      ),
                  }}
                />

                <span>
                  {item.name}
                </span>

              </div>

              <strong>
                {item.value}
              </strong>

              <span className="vehicle-status-percentage">
                {percentage}%
              </span>

            </div>
          );

        })}

      </div>

    </section>
  );
}

export default VehicleStatusChart;