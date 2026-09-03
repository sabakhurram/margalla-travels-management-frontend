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
import Admins from "./Admin/Admin";
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
  const [searchQuery, setSearchQuery] = useState("");
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
        "https://api.margallatravels.com.pk/api/dashboard/overview",
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
const normalizedSearchQuery = searchQuery
  .trim()
  .toLowerCase();

const filteredMileageUtilization = (
  dashboardData?.mileageUtilization || []
).filter((item) => {
  if (!normalizedSearchQuery) return true;

  return (
    item.vehicle?.registration_number
      ?.toLowerCase()
      .includes(normalizedSearchQuery) ||
    item.vehicle?.model
      ?.toLowerCase()
      .includes(normalizedSearchQuery)
  );
});

const filteredRecentActivity = (
  dashboardData?.recentActivity || []
).filter((item) => {
  if (!normalizedSearchQuery) return true;

  return (
    item.vehicle?.registration_number
      ?.toLowerCase()
      .includes(normalizedSearchQuery) ||
    item.vehicle?.model
      ?.toLowerCase()
      .includes(normalizedSearchQuery) ||
    item.driver?.name
      ?.toLowerCase()
      .includes(normalizedSearchQuery) ||
    item.user?.name
      ?.toLowerCase()
      .includes(normalizedSearchQuery) ||
    item.action
      ?.toLowerCase()
      .includes(normalizedSearchQuery)
  );
});

const filteredAlerts = (
  dashboardData?.alerts || []
).filter((item) => {
  if (!normalizedSearchQuery) return true;

  return (
    item.vehicle?.registration_number
      ?.toLowerCase()
      .includes(normalizedSearchQuery) ||
    item.vehicle?.model
      ?.toLowerCase()
      .includes(normalizedSearchQuery) ||
    item.driver?.name
      ?.toLowerCase()
      .includes(normalizedSearchQuery) ||
    item.message
      ?.toLowerCase()
      .includes(normalizedSearchQuery) ||
    item.title
      ?.toLowerCase()
      .includes(normalizedSearchQuery)
  );
});
  return (
    <div className="admin-layout">
<Sidebar
  isOpen={sidebarOpen}
  setIsOpen={setSidebarOpen}
  activeTab={activeTab}
  setActiveTab={(tab) => {
    setFilteredDriverIds(null);
    setFilteredMileageVehicleIds(null);
    setSearchQuery("");
    setActiveTab(tab);
  }}
/>

      <main className="admin-main">

<AdminHeader
  setSidebarOpen={setSidebarOpen}
  activeTab={activeTab}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  alerts={dashboardData?.alerts || []}
  onViewAlerts={(alert) => {
    setSearchQuery("");

    if (alert.type === "missing-mileage") {
      setActiveTab("drivers");
    }

    if (
      alert.type === "daily-exceeded" ||
      alert.type === "monthly-exceeded"
    ) {
      setActiveTab("mileage");
    }
  }}
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
  data={filteredMileageUtilization}
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
  data={filteredRecentActivity}
  loading={dashboardLoading}
  onViewAll={() => setActiveTab("audit-logs")}
/>
<AlertsPanel
  data={filteredAlerts}
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
  <Categories searchQuery={searchQuery} />
)}
 {activeTab === "vehicles" && (
  <Vehicles searchQuery={searchQuery} />
)}
  {activeTab === "drivers" && (
  <Drivers
    filteredDriverIds={filteredDriverIds}
    searchQuery={searchQuery}
  />
)}
{activeTab === "admins" && (
  <Admins searchQuery={searchQuery} />
)}
{activeTab === "mileage" && (
  <Mileage
    filteredVehicleIds={filteredMileageVehicleIds}
    searchQuery={searchQuery}
  />
)}
{activeTab === "reports" && (
  <Reports searchQuery={searchQuery} />
)}
{activeTab === "audit-logs" && (
  <AuditLogs searchQuery={searchQuery} />
)}
</div>

  

      </main>

    </div>
  );
}

export default AdminDashboard;