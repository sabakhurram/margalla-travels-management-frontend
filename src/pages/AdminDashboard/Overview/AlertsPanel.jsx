import {
  AlertTriangle,
  Users,
  CarFront,
  ArrowUpRight,
} from "lucide-react";

import "./AlertsPanel.css";

function AlertsPanel() {
  const alerts = [
    {
      id: 1,
      type: "critical",
      icon: Users,
      count: "3",
      title: "Drivers missing mileage",
      description: "Today's mileage has not been submitted.",
      action: "Review drivers",
    },
    {
      id: 2,
      type: "warning",
      icon: CarFront,
      count: "2",
      title: "Vehicles under maintenance",
      description: "These vehicles are currently unavailable.",
      action: "View vehicles",
    },
  ];

  const totalAlerts = alerts.reduce(
    (total, alert) => total + Number(alert.count),
    0
  );

  return (
    <section className="alerts-panel">

      {/* Header */}
      <div className="alerts-header">

        <div className="alerts-title-wrapper">

          <div className="alerts-title-icon">
            <AlertTriangle size={16} />
          </div>

          <div>
            <div className="alerts-title-row">
              <h3>Alerts & Actions</h3>

              <span className="alerts-count">
                {totalAlerts}
              </span>
            </div>

            <p>
              Items that need your attention.
            </p>
          </div>

        </div>

        <button className="alerts-view-all">
          View all
          <ArrowUpRight size={14} />
        </button>

      </div>


      {/* Alerts */}
      <div className="alerts-list">

        {alerts.map((alert) => {
          const Icon = alert.icon;

          return (
            <div
              className={`alert-card alert-${alert.type}`}
              key={alert.id}
            >

              <div className="alert-card-icon">
                <Icon size={17} />
              </div>


              <div className="alert-card-content">

                <div className="alert-card-title-row">

                  <h4>
                    {alert.title}
                  </h4>

                  <span className="alert-number">
                    {alert.count}
                  </span>

                </div>

                <p>
                  {alert.description}
                </p>

                <button className="alert-review">
                  {alert.action}
                  <ArrowUpRight size={12} />
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}

export default AlertsPanel;