import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Overview/Sidebar";
import AdminHeader from "./Overview/AdminHeader";
import AlertsPanel from "./Overview/AlertsPanel";
import MileageChart from "./Overview/MileageChart";
import VehicleStatusChart from "./Overview/VehicleStatusChart";
import RecentActivity from "./Overview/RecentActivity";
import Categories from "./Categories/Categories";
import Vehicles from "./Vehicles/Vehicles";
import Drivers from "./Drivers/Drivers";
import Mileage from "./Mileage/Mileage";
import Reports from "./Reports/Reports";
import AuditLogs from "./AuditLogs/AuditLogs";
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
  const { session } = useAuth();

const [dashboardData, setDashboardData] = useState(null);
const [dashboardLoading, setDashboardLoading] = useState(true);
const [dashboardError, setDashboardError] = useState("");
const [filteredDriverIds, setFilteredDriverIds] =
  useState(null);
  const [filteredMileageVehicleIds, setFilteredMileageVehicleIds] =
  useState(null);
useEffect(() => {
  const fetchDashboardOverview = async () => {
    if (!session?.access_token) return;

    try {
      setDashboardLoading(true);
      setDashboardError("");

      const response = await fetch(
        "http://localhost:5000/api/dashboard/overview",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load dashboard"
        );
      }

      setDashboardData(data);

    } catch (error) {
      console.error(
        "Dashboard overview error:",
        error
      );

      setDashboardError(
        error.message ||
          "Failed to load dashboard"
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  fetchDashboardOverview();
}, [session]);

  return (
    <div className="admin-layout">
<Sidebar
  isOpen={sidebarOpen}
  setIsOpen={setSidebarOpen}
  activeTab={activeTab}
  setActiveTab={(tab) => {
    setFilteredDriverIds(null);
    setFilteredMileageVehicleIds(null);
    setActiveTab(tab);
  }}
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
    <h1>Overview</h1>

    <p>
      Here's what's happening with your fleet today.
    </p>
  </div>
</div>
{dashboardError && (
  <div className="dashboard-error">
    {dashboardError}
  </div>
)}
  <div className="kpi-grid">
<KPICard
  title="Total Vehicles"
  value={
    dashboardLoading
      ? "..."
      : dashboardData?.kpis?.totalVehicles ?? 0
  }
  subtitle="Registered vehicles"
  icon={CarFront}
  variant="default"
/>
 <KPICard
  title="Total Drivers"
  value={
    dashboardLoading
      ? "..."
      : dashboardData?.kpis?.totalDrivers ?? 0
  }
  subtitle="Registered drivers"
  icon={Users}
  variant="info"
/>

 <KPICard
  title="Monthly KM"
  value={
    dashboardLoading
      ? "..."
      : Number(
          dashboardData?.kpis?.monthlyKm ?? 0
        ).toLocaleString()
  }
  subtitle="Mileage recorded this month"
  icon={Gauge}
  variant="success"
/>
<KPICard
  title="Alerts"
  value={
    dashboardLoading
      ? "..."
      : dashboardData?.kpis?.alerts ?? 0
  }
  subtitle="Requires your attention"
  icon={Bell}
  variant="warning"
/>
</div>

<div className="dashboard-charts">
  <MileageChart
  data={dashboardData?.mileageUtilization || []}
  loading={dashboardLoading}
/>
  <VehicleStatusChart
  data={
    dashboardData?.vehicleStatus || {
      active: 0,
      inactive: 0,
      maintenance: 0,
    }
  }
  loading={dashboardLoading}
/>
</div>
<div className="dashboard-bottom-grid">

 <RecentActivity
  data={dashboardData?.recentActivity || []}
  loading={dashboardLoading}
onViewAll={() => setActiveTab("audit-logs")}
/>

<AlertsPanel
  data={dashboardData?.alerts || []}
  loading={dashboardLoading}

  onViewDrivers={(driverIds) => {
    setFilteredDriverIds(driverIds);
    setActiveTab("drivers");
  }}

  onViewMileage={(vehicleIds) => {
    setFilteredMileageVehicleIds(vehicleIds);
    setActiveTab("mileage");
  }}

  onViewVehicles={(vehicleIds) => {
    setActiveTab("vehicles");
  }}
/>

</div>
    </>
  )}

  {activeTab === "categories" && (
    <Categories />
  )}
 {activeTab === "vehicles" && (
    <Vehicles />
  )}
   {activeTab === "drivers" && (
  <Drivers
    filteredDriverIds={filteredDriverIds}
  />
)}
 {activeTab === "mileage" && (
  <Mileage
    filteredVehicleIds={filteredMileageVehicleIds}
  />
)}
{activeTab === "reports" && <Reports />}
{activeTab === "audit-logs" &&(<AuditLogs />) }
</div>

  

      </main>

    </div>
  );
}

export default AdminDashboard;