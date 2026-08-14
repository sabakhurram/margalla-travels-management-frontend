import {
  Menu,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

import "./AdminHeader.css";

function AdminHeader({ setSidebarOpen }) {
  const { profile } = useAuth();

  const adminName = profile?.name || "Admin User";

  return (
    <header className="admin-header">

      <div className="header-left">

        <button
          className="header-menu-button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={21} />
        </button>

        <div className="header-title">
          <span>Management Dashboard</span>
          <h1>Dashboard</h1>
        </div>

      </div>

      <div className="header-right">

        <div className="header-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search anything..."
          />
        </div>

        <button
          className="header-icon-button"
          aria-label="Notifications"
        >
          <Bell size={19} />

          <span className="notification-dot" />
        </button>

        <div className="header-user">

          <div className="header-avatar">
            {adminName.charAt(0).toUpperCase()}
          </div>

          <div className="header-user-info">
            <strong>{adminName}</strong>
            <span>Administrator</span>
          </div>

          <ChevronDown size={15} />

        </div>

      </div>

    </header>
  );
}

export default AdminHeader;