import React from "react";
import "./style.css";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";

const icons = [
  { id: "Dashboard",   path: "/dashboard",   icon: "famicons:home",                  label: "Dashboard"   },
  { id: "Attendance",  path: "/attendance",  icon: "lucide:calendar-check",          label: "Attendance"  },
  { id: "Onboarding",  path: "/onboarding",  icon: "fluent-mdl2:onboarding",         label: "Onboarding"  },
  { id: "Training",    path: "/training",    icon: "fluent:learning-app-16-filled",  label: "Training"    },
  { id: "Performance", path: "/performance", icon: "mdi:speedometer",                label: "Performance" },
  { id: "Payroll",     path: "/payroll",     icon: "bx:money-withdraw",              label: "Payroll"     },
  { id: "Reports",     path: "/reports",     icon: "carbon:report",                  label: "Reports"     },
];

const CustomIcon = ({ activeIconId, collapsed }) => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname.startsWith(path) || activeIconId === path;

  return (
    <div className="nav-items">
      {icons.map((iconData) => (
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
