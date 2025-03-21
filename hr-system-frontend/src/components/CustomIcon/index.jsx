import React from "react";
import "./style.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
    // path: "/logout",
    icon: <Icon icon="mage:logout" width="33" height="33" color="white" />,
  },
];

const CustomIcon = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    alert("Kefak feha?");
    navigate("/dashboard");
  };
  return (
    <div className="sidebar-icon">
      {icons.map((iconData) => (
        <div key={iconData.id} className="sidebar-icon-container">
          {iconData.path ? (
            <Link
              to={iconData.path}
              className={`icon ${
                location.pathname === iconData.path ? "active" : ""
              }`}
            >
              {iconData.icon}
            </Link>
          ) : (
            <div className="icon" onClick={handleLogout}>
              {iconData.icon}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomIcon;
