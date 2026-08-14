import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import "./VehicleStatusChart.css";

function VehicleStatusChart() {
  // Temporary data.
  // Later this will come from Supabase.
  const vehicleStatus = [
    {
      name: "Active",
      value: 25,
    },
    {
      name: "Maintenance",
      value: 4,
    },
    {
      name: "Inactive",
      value: 3,
    },
  ];

  const statusColors = {
    Active: "#0797a8",
    Maintenance: "#e6a23c",
    Inactive: "#b8c1cb",
  };

  const totalVehicles = vehicleStatus.reduce(
    (total, item) => total + item.value,
    0
  );

  return (
    <section className="vehicle-status-card">

      <div className="vehicle-status-header">
        <div>
          <h3>Vehicle Status</h3>

          <p>
            Current fleet availability.
          </p>
        </div>

        <span className="vehicle-status-period">
          Today
        </span>
      </div>

      <div className="vehicle-status-content">

        <div className="vehicle-status-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vehicleStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={78}
                paddingAngle={3}
                stroke="none"
              >
                {vehicleStatus.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={statusColors[entry.name]}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  border: "1px solid #e8edf2",
                  borderRadius: "8px",
                  boxShadow:
                    "0 4px 15px rgba(30, 55, 80, 0.08)",
                  fontSize: "10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="vehicle-status-center">
            <strong>{totalVehicles}</strong>
            <span>Total</span>
          </div>
        </div>

        <div className="vehicle-status-legend">

          {vehicleStatus.map((item) => (
            <div
              className="vehicle-status-item"
              key={item.name}
            >
              <div className="vehicle-status-name">
                <span
                  className="vehicle-status-dot"
                  style={{
                    backgroundColor:
                      statusColors[item.name],
                  }}
                ></span>

                <span>{item.name}</span>
              </div>

              <strong>{item.value}</strong>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}

export default VehicleStatusChart;