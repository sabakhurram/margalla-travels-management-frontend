import {
  LayoutDashboard,
  CarFront,
  Users,
  Gauge,
  Tags,
  ClipboardList,
  FileText,
  LogOut,
    ShieldCheck,
  Menu,
  X,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import logo from "../../../assets/logo2.png";

import "./Sidebar.css";

function Sidebar({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
}) {
  const { logout } = useAuth();
const { profile } = useAuth();
  const navigationItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      tab: "overview",
    },
    {
      label: "Vehicles",
      icon: CarFront,
      tab: "vehicles",
    },
    {
      label: "Drivers",
      icon: Users,
      tab: "drivers",
    },
    {
  
  label: "Admins",
  icon: Users,
  tab: "admins",
},
    {
      label: "Mileage",
      icon: Gauge,
      tab: "mileage",
    },
 
    {
      label: "Categories",
      icon: Tags,
      tab: "categories",
    },
       {
      label: "Reports",
      icon: FileText,
      tab: "reports",
    },
    {
      label: "Audit Logs",
      icon: ClipboardList,
      tab: "audit-logs",
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        {/* Logo */}
        <div className="sidebar-brand">
          <img
            src={logo}
            alt="Margalla Travels"
            className="sidebar-logo"
          />

          <button
            className="sidebar-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-navigation">
          <p className="sidebar-section-title">
            MAIN MENU
          </p>

          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`sidebar-nav-item ${
                  activeTab === item.tab
                    ? "sidebar-nav-item-active"
                    : ""
                }`}
                onClick={() => {
                  setActiveTab(item.tab);
                  setIsOpen(false);
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                />

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

       {/* Bottom section */}
<div className="sidebar-bottom">

 <div className="sidebar-user">

    <div className="sidebar-user-avatar">
      <span>
        {profile?.name?.charAt(0)?.toUpperCase() ||
          profile?.username?.charAt(0)?.toUpperCase() ||
          "A"}
      </span>
    </div>

    <div className="sidebar-user-info">

      <strong>
        {profile?.name ||
          profile?.username ||
          "Admin"}
      </strong>

      <span>
        {profile?.role === "admin"
          ? "Administrator"
          : profile?.role || "User"}
      </span>

    </div>
    </div>


  {/* Sign Out */}
  <button
    className="sidebar-logout"
    onClick={logout}
  >
    <LogOut size={17} strokeWidth={2} />

    <span>Sign out</span>
  </button>

</div>

      </aside>
    </>
  );
}

export default Sidebar;