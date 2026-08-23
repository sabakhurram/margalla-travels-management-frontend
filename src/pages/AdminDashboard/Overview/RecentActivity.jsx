import {
  Gauge,
  ArrowUpRight,
} from "lucide-react";

import "./RecentActivity.css";

function formatActivityTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} ${
      diffMinutes === 1 ? "min" : "mins"
    } ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} ${
      diffHours === 1 ? "hour" : "hours"
    } ago`;
  }

  if (diffDays < 7) {
    return `${diffDays} ${
      diffDays === 1 ? "day" : "days"
    } ago`;
  }

  return date.toLocaleDateString();
}

function RecentActivity({
  data = [],
  loading = false,
  onViewAll,
}) {
  const activities = data.map((activity) => ({
    ...activity,
    time: formatActivityTime(activity.createdAt),
    icon: Gauge,
    label: "Mileage",
  }));

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

       <button
  className="activity-view-all"
  onClick={onViewAll}
>
  View All
  <ArrowUpRight size={14} />
</button>

      </div>

      <div className="activity-list">

        {loading ? (
          <div className="activity-empty">
            Loading recent activity...
          </div>
        ) : activities.length === 0 ? (
          <div className="activity-empty">
            No recent activity found.
          </div>
        ) : (
          activities.map((activity) => {

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
          })
        )}

      </div>

      <div className="activity-footer">
        {loading
          ? "Loading activities..."
          : `Showing latest ${activities.length} ${
              activities.length === 1
                ? "activity"
                : "activities"
            }`}
      </div>

    </section>
  );
}

export default RecentActivity;