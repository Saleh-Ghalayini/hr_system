import React from "react";
import "./style.css";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const icons = [
  { id: "Dashboard",    path: "/dashboard",    icon: "mdi:home-outline",               label: "Dashboard", roles: ["admin"] },
  { id: "Announcements",path: "/announcements",icon: "mdi:bullhorn-outline",           label: "Announce"     },
  { id: "Attendance",   path: "/attendance",   icon: "mdi:calendar-check-outline",     label: "Attendance"   },
  { id: "Onboarding",   path: "/onboarding",   icon: "mdi:account-plus-outline",       label: "Onboarding"   },
  { id: "Training",     path: "/training",     icon: "mdi:school-outline",             label: "Training",     roles: ["admin", "manager", "user"] },
  { id: "Performance",  path: "/performance",  icon: "mdi:chart-line",                 label: "Performance"  },
  { id: "Payroll",      path: "/payroll",      icon: "mdi:cash-multiple",              label: "Payroll",      roles: ["admin", "manager"] },
  { id: "Holidays",     path: "/holidays",     icon: "mdi:calendar-star-outline",      label: "Holidays"     },
  { id: "Directory",    path: "/directory",    icon: "mdi:account-group-outline",      label: "Directory"    },
];

const CustomIcon = ({ activeIconId, collapsed }) => {
  const location = useLocation();
  const { user, loading } = useAuthContext();

  const isActive = (path) =>
    location.pathname.startsWith(path) || activeIconId === path;

  const visibleIcons = icons.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (loading) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <div className="nav-items">
      {visibleIcons.map((iconData) => (
        <div
          key={iconData.id}
          className="nav-item-wrapper"
          title={collapsed ? iconData.label : ""}
        >
          <Link
            to={iconData.path}
            className={`nav-item ${isActive(iconData.path) ? "active" : ""}`}
          >
            <Icon icon={iconData.icon} width="22" height="22" color="white" className="nav-icon" />
            {!collapsed && <span className="nav-label">{iconData.label}</span>}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default CustomIcon;
