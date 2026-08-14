import { ArrowUpRight } from "lucide-react";

import "./KPICard.css";

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
  trendLabel,
}) {
  return (
    <div className={`kpi-card kpi-${variant}`}>

      <div className="kpi-card-header">

        <div className="kpi-icon">
          <Icon size={18} strokeWidth={1.8} />
        </div>

        {trend && (
          <span className="kpi-trend">
            {trend}
          </span>
        )}

      </div>


      <div className="kpi-card-content">

        <span className="kpi-title">
          {title}
        </span>

        <strong className="kpi-value">
          {value}
        </strong>

        <div className="kpi-card-bottom">

          <span className="kpi-subtitle">
            {trendLabel || subtitle}
          </span>

          <ArrowUpRight
            className="kpi-arrow"
            size={14}
          />

        </div>

      </div>

    </div>
  );
}

export default KPICard;