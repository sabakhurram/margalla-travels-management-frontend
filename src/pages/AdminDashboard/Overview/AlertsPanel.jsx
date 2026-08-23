import {
  AlertTriangle,
  Users,
  CarFront,
  Gauge,
  ArrowUpRight,
} from "lucide-react";

import "./AlertsPanel.css";

function AlertsPanel({
  data = [],
  loading = false,
  onViewDrivers,
  onViewMileage,
}) {
  const handleAlertAction = (alert) => {
    switch (alert.id) {
      case "missing-mileage":
        onViewDrivers?.(alert.driverIds || []);
        break;

      case "daily-limit":
        onViewMileage?.(alert.vehicleIds || []);
        break;

      case "monthly-limit":
        onViewMileage?.(alert.vehicleIds || []);
        break;

      default:
        break;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "missing-mileage":
        return Users;

      case "daily-limit":
        return Gauge;

      case "monthly-limit":
        return CarFront;

      default:
        return AlertTriangle;
    }
  };

  const totalAlerts = data.reduce(
    (total, alert) =>
      total + Number(alert.count || 0),
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
                {loading ? "..." : totalAlerts}
              </span>
            </div>

            <p>
              Items that need your attention.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="alerts-view-all"
        >
          View all
          <ArrowUpRight size={14} />
        </button>

      </div>

      {/* Alerts */}
      <div className="alerts-list">

        {loading ? (
          <div className="alerts-empty">
            Loading alerts...
          </div>
        ) : data.length === 0 ? (
          <div className="alerts-empty">
            No alerts require your attention.
          </div>
        ) : (
          data.map((alert) => {

            const Icon = getAlertIcon(
              alert.type
            );

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

                  <button
                    type="button"
                    className="alert-review"
                    onClick={() =>
                      handleAlertAction(alert)
                    }
                  >
                    {alert.action}
                    <ArrowUpRight size={12} />
                  </button>

                </div>

              </div>
            );
          })
        )}

      </div>

    </section>
  );
}

export default AlertsPanel;