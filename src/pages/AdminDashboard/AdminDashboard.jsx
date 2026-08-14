import { useState } from "react";

import Sidebar from "./components/Sidebar";
import AdminHeader from "./components/AdminHeader";
import AlertsPanel from "./components/AlertsPanel";
import MileageChart from "./components/MileageChart";
import VehicleStatusChart from "./components/VehicleStatusChart";
import RecentActivity from "./components/RecentActivity";
import {
  CarFront,
  Users,
  Gauge,
  BellRing,
  Bell
} from "lucide-react";

import KPICard from "./components/KPICard";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">

      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="admin-main">

        <AdminHeader
          setSidebarOpen={setSidebarOpen}
        />

        <div className="admin-content">

  <div className="dashboard-intro">
    <div>
      <h2>Overview</h2>

      <p>
        Here's what's happening with your fleet today.
      </p>
    </div>
  </div>

  <div className="kpi-grid">
<KPICard
  title="Total Vehicles"
  value="32"
  subtitle="Active fleet"
  trend="+6.2%"
  icon={CarFront}
  variant="default"
/>
   <KPICard
  title="Total Drivers"
  value="28"
  subtitle="Registered drivers"
  trend="+7.6%"
  icon={Users}
  variant="info"
/>

    <KPICard
  title="Monthly KM"
  value="12,450"
  subtitle="Higher than last month"
  trend="+8.4%"
  icon={Gauge}
  variant="success"
/>

   <KPICard
  title="Alerts"
  value="5"
  subtitle="Requires your attention"
  icon={Bell}
  variant="warning"
/>
</div>

<div className="dashboard-charts">
  <MileageChart />
   <VehicleStatusChart />
</div>
<div className="dashboard-bottom-grid">

  <RecentActivity />

  <AlertsPanel />

</div>
  </div>



      </main>

    </div>
  );
}

export default AdminDashboard;