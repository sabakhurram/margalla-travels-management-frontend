import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  AlertTriangle,
  X,
   UserRound,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";

import { useAuth } from "../../../context/AuthContext";

import "./AdminHeader.css";

function AdminHeader({
  setSidebarOpen,
  activeTab,
  searchQuery,
  setSearchQuery,
  alerts = [],
  onViewAlerts,
}) {
  const { profile } = useAuth();
const [profileOpen, setProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] =
    useState(false);

  const notificationRef = useRef(null);

  const pageTitles = {
    overview: "Dashboard",
    categories: "Categories",
    vehicles: "Vehicles",
    drivers: "Drivers",
    mileage: "Mileage",
    "audit-logs": "Audit Logs",
    reports: "Reports",
  };

  const currentTitle =
    pageTitles[activeTab] || "Dashboard";

  const adminName = profile?.name || "Admin User";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleNotificationClick = (alert) => {
    setShowNotifications(false);

    if (onViewAlerts) {
      onViewAlerts(alert);
    }
  };

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
          <h1>{currentTitle}</h1>
        </div>

      </div>


      <div className="header-right">

        {/* SEARCH */}

        <div className="header-search">

          <Search size={17} />

          <input
            type="text"
            placeholder={`Search ${currentTitle.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
          />

        </div>


        {/* NOTIFICATIONS */}

        <div
          className="notification-wrapper"
          ref={notificationRef}
        >

          <button
            className="header-icon-button"
            aria-label="Notifications"
            onClick={() =>
              setShowNotifications(
                (previous) => !previous
              )
            }
          >

            <Bell size={19} />

            {alerts.length > 0 && (
              <span className="notification-dot" />
            )}

          </button>


          {showNotifications && (

            <div className="notification-dropdown">

              <div className="notification-header">

                <div>

                  <h3>Notifications</h3>

                  <span>
                    {alerts.length}{" "}
                    {alerts.length === 1
                      ? "alert"
                      : "alerts"}
                  </span>

                </div>

                <button
                  className="notification-close"
                  onClick={() =>
                    setShowNotifications(false)
                  }
                  aria-label="Close notifications"
                >
                  <X size={16} />
                </button>

              </div>


              <div className="notification-list">

                {alerts.length === 0 ? (

                  <div className="notification-empty">

                    <Bell size={28} />

                    <p>
                      No notifications
                    </p>

                  </div>

                ) : (

                  alerts.map((alert) => (

                    <button
                      key={alert.id}
                      className="notification-item"
                      onClick={() =>
                        handleNotificationClick(
                          alert
                        )
                      }
                    >

                      <div className="notification-icon">
                        <AlertTriangle size={17} />
                      </div>


                      <div className="notification-content">

                        <div className="notification-title-row">

                          <strong>
                            {alert.title}
                          </strong>

                          {alert.count > 0 && (
                            <span className="notification-count">
                              {alert.count}
                            </span>
                          )}

                        </div>

                        <span>
                          {alert.description}
                        </span>

                      </div>

                    </button>

                  ))

                )}

              </div>

            </div>

          )}

        </div>


        {/* USER */}

     <div className="header-profile-wrapper">

  <button
    className="header-user"
    onClick={() =>
      setProfileOpen((prev) => !prev)
    }
    aria-label="Open profile menu"
  >

    <div className="header-avatar">
      {adminName.charAt(0).toUpperCase()}
    </div>

    <div className="header-user-info">
      <strong>{adminName}</strong>
    </div>

    <ChevronDown
      size={15}
      className={
        profileOpen
          ? "profile-chevron-open"
          : ""
      }
    />

  </button>

  {profileOpen && (
    <div className="profile-dropdown">

      <div className="profile-dropdown-header">

        <div className="profile-dropdown-avatar">
          {adminName.charAt(0).toUpperCase()}
        </div>

        <div>
          <strong>{adminName}</strong>

          <span>
            Administrator
          </span>
        </div>

      </div>

      <div className="profile-dropdown-divider" />


    </div>
  )}

</div>
      </div>

    </header>
  );
}

export default AdminHeader;