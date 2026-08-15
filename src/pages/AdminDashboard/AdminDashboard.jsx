import { useState } from "react";

import Sidebar from "./Overview/Sidebar";
import AdminHeader from "./Overview/AdminHeader";
import AlertsPanel from "./Overview/AlertsPanel";
import MileageChart from "./Overview/MileageChart";
import VehicleStatusChart from "./Overview/VehicleStatusChart";
import RecentActivity from "./Overview/RecentActivity";
import Categories from "./Categories/Categories";
import Vehicles from "./Vehicles/Vehicles";
import {
  CarFront,
  Users,
  Gauge,
  BellRing,
  Bell
} from "lucide-react";

import KPICard from "./Overview/KPICard";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="admin-layout">

     <Sidebar
  isOpen={sidebarOpen}
  setIsOpen={setSidebarOpen}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
/>

      <main className="admin-main">

        <AdminHeader
  setSidebarOpen={setSidebarOpen}
  activeTab={activeTab}
/>

       <div className="admin-content">

  {activeTab === "overview" && (
    <>
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
    </>
  )}

  {activeTab === "categories" && (
    <Categories />
  )}
 {activeTab === "vehicles" && (
    <Vehicles />
  )}
</div>

  

      </main>

    </div>
  );
}

export default AdminDashboard;