import React from "react";
import "./style.css";
import { Icon } from "@iconify/react/dist/iconify.js";

const icons = [
  {
    id: "Dashboard",
    icon: <Icon icon="famicons:home" width="33" height="33" color="white" />,
  },
  {
    id: "Attendance",
    icon: (
      <Icon icon="lucide:calendar-check" width="33" height="33" color="white" />
    ),
  },
  {
    id: "Onboarding",
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
    icon: <Icon icon="mdi:speedometer" width="33" height="33" color="white" />,
  },
  {
    id: "Payroll",
    icon: (
      <Icon icon="bx:money-withdraw" width="33" height="33" color="white" />
    ),
  },
  {
    id: "Reports",
    icon: <Icon icon="carbon:report" width="33" height="33" color="white" />,
  },
  {
    id: "Logout",
    icon: <Icon icon="mage:logout" width="33" height="33" color="white" />,
  },
];

const CustomIcon = ({ activeIconId, onIconClick }) => {
  return (
    <div className="sidebar-icon">
      {icons.map((iconData) => (
        <div key={iconData.id} className="sidebar-icon-container">
          <div
            className={`icon ${activeIconId === iconData.id ? "active" : ""}`}
            onClick={() => onIconClick(iconData.id)}
          >
            {iconData.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomIcon;
