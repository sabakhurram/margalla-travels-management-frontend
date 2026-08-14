import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import "./MileageChart.css";

function MileageChart() {
  // Temporary data.
  // Later this will come from Supabase.
  const mileageData = [
    {
      vehicle: "Fortuner",
      used: 6300,
      limit: 6000,
      percentage: 105,
    },
    {
      vehicle: "Corolla",
      used: 4200,
      limit: 5000,
      percentage: 84,
    },
    {
      vehicle: "Civic",
      used: 2500,
      limit: 4000,
      percentage: 62,
    },
    {
      vehicle: "Hiace",
      used: 3100,
      limit: 6000,
      percentage: 52,
    },
    {
      vehicle: "Land Cruiser",
      used: 2500,
      limit: 6000,
      percentage: 42,
    },
  ];

  const getBarColor = (percentage) => {
    if (percentage >= 100) {
      return "#e85b5b";
    }

    if (percentage >= 80) {
      return "#e6a23c";
    }

    return "#0797a8";
  };

  return (
    <section className="mileage-chart-card">

      <div className="mileage-chart-header">
        <div>
          <h3>Mileage Utilization</h3>

          <p>
            Vehicles closest to their monthly mileage limit.
          </p>
        </div>

        <span className="mileage-chart-period">
          This Month
        </span>
      </div>

      <div className="mileage-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mileageData}
            layout="vertical"
            margin={{
              top: 5,
              right: 35,
              left: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid
              stroke="#edf1f5"
              strokeDasharray="3 3"
              horizontal={false}
            />

            <XAxis
              type="number"
              domain={[0, 120]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#8a96a5",
                fontSize: 9,
              }}
              tickFormatter={(value) => `${value}%`}
            />

            <YAxis
              type="category"
              dataKey="vehicle"
              axisLine={false}
              tickLine={false}
              width={80}
              tick={{
                fill: "#536274",
                fontSize: 10,
              }}
            />

            <Tooltip
              cursor={{ fill: "#f5f8fa" }}
              contentStyle={{
                border: "1px solid #e8edf2",
                borderRadius: "8px",
                boxShadow: "0 4px 15px rgba(30, 55, 80, 0.08)",
                fontSize: "10px",
              }}
              formatter={(value, name, props) => {
                if (name === "percentage") {
                  return [
                    `${value}%`,
                    "Mileage used",
                  ];
                }

                return [value, name];
              }}
            />

            <Bar
              dataKey="percentage"
              radius={[0, 5, 5, 0]}
              barSize={17}
            >
              {mileageData.map((entry) => (
                <Cell
                  key={entry.vehicle}
                  fill={getBarColor(entry.percentage)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mileage-legend">

        <div className="mileage-legend-item">
          <span className="legend-dot normal"></span>
          <span>Normal</span>
          <strong>&lt; 80%</strong>
        </div>

        <div className="mileage-legend-item">
          <span className="legend-dot warning"></span>
          <span>Warning</span>
          <strong>80–99%</strong>
        </div>

        <div className="mileage-legend-item">
          <span className="legend-dot critical"></span>
          <span>Exceeded</span>
          <strong>100%+</strong>
        </div>

      </div>

    </section>
  );
}

export default MileageChart;