import {
  Gauge,
  Wrench,
  UserPlus,
  CarFront,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

import "./RecentActivity.css";

function RecentActivity() {
  const activities = [
    {
      id: 1,
      time: "42 mins ago",
      title: "Mileage Entry Submitted",
      description: "Ali Khan submitted 135 km for Toyota Corolla",
      type: "mileage",
      icon: Gauge,
      label: "Mileage",
    },
    {
      id: 2,
      time: "1 hour ago",
      title: "Vehicle Maintenance Scheduled",
      description: "Toyota Fortuner is scheduled for maintenance",
      type: "maintenance",
      icon: Wrench,
      label: "Maintenance",
    },
    {
      id: 3,
      time: "2 hours ago",
      title: "New Driver Added",
      description: "Usman Tariq has been added as a driver",
      type: "driver",
      icon: UserPlus,
      label: "Drivers",
    },
    {
      id: 4,
      time: "3 hours ago",
      title: "Mileage Limit Exceeded",
      description: "Toyota Fortuner exceeded its monthly limit",
      type: "alert",
      icon: AlertTriangle,
      label: "Alert",
    },
    {
      id: 5,
      time: "5 hours ago",
      title: "Vehicle Added",
      description: "Honda Civic has been added to the fleet",
      type: "vehicle",
      icon: CarFront,
      label: "Vehicles",
    },
  ];

  return (
    <section className="recent-activity-card">

      <div className="recent-activity-header">

        <div className="recent-activity-heading">

          <div className="recent-activity-main-icon">
            <Gauge size={17} />
          </div>

          <div>
            <h3>Recent Activity</h3>

            <p>
              Latest updates from your system
            </p>
          </div>

        </div>

        <button className="activity-view-all">
          View All
          <ArrowUpRight size={14} />
        </button>

      </div>


      <div className="activity-list">

        {activities.map((activity) => {

          const Icon = activity.icon;

          return (
            <div
              className="activity-item"
              key={activity.id}
            >

              <div className="activity-time">
                {activity.time}
              </div>


              <div
                className={`activity-icon activity-${activity.type}`}
              >
                <Icon size={14} />
              </div>


              <div className="activity-line" />


              <div className="activity-content">

                <div className="activity-title-row">

                  <h4>
                    {activity.title}
                  </h4>

                  <span
                    className={`activity-tag tag-${activity.type}`}
                  >
                    {activity.label}
                  </span>

                </div>

                <p>
                  {activity.description}
                </p>

              </div>

            </div>
          );

        })}

      </div>


      <div className="activity-footer">
        Showing latest 5 activities
      </div>

    </section>
  );
}

export default RecentActivity;