import React from "react";
import "./style.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const icons = [
  {
    id: "Dashboard",
    path: "/dashboard",
    icon: <Icon icon="famicons:home" width="33" height="33" color="white" />,
  },
  {
    id: "Attendance",
    path: "/attendance",
    icon: (
      <Icon icon="lucide:calendar-check" width="33" height="33" color="white" />
    ),
  },
  {
    id: "Onboarding",
    path: "/onboarding",
    icon: (
      <Icon
        icon="fluent-mdl2:onboarding"
        width="33"
        height="33"
        color="white"
      />
    ),
  },
  {
    id: "Training",
    path: "/training",
    icon: (
      <Icon
        icon="fluent:learning-app-16-filled"
        width="33"
        height="33"
        color="white"
      />
    ),
  },
  {
    id: "Performance",
    path: "/performance",
    icon: <Icon icon="mdi:speedometer" width="33" height="33" color="white" />,
  },
  {
    id: "Payroll",
    path: "/payroll",
    icon: (
      <Icon icon="bx:money-withdraw" width="33" height="33" color="white" />
    ),
  },
  {
    id: "Reports",
    path: "/reports",
    icon: <Icon icon="carbon:report" width="33" height="33" color="white" />,
  },
  {
    id: "Logout",
    icon: <Icon icon="mage:logout" width="33" height="33" color="white" />,
  },
];

const CustomIcon = ({ activeIconId }) => {
  const location = useLocation();
  const { logout } = useAuthContext();

  const isActive = (path) => {
    return location.pathname.startsWith(path) || activeIconId === path;
  };

  return (
    <div className="sidebar-icon">
      {icons.map((iconData) => (
        <div key={iconData.id} className="sidebar-icon-container">
          {iconData.path ? (
            <Link
              to={iconData.path}
              className={`icon ${isActive(iconData.path) ? "active" : ""}`}
            >
              {iconData.icon}
            </Link>
          ) : (
            <div className="icon" onClick={logout}>
              {iconData.icon}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomIcon;
