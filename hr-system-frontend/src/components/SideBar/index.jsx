import { useState } from "react";
import "./style.css";
import CustomIcon from "../CustomIcon";
import { Icon } from "@iconify/react";

const SideBar = ({ activePage }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className={`sidebar-container ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
      <div className="sidebar-body">
        <CustomIcon activeIconId={activePage} collapsed={collapsed} />
      </div>
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Icon
          icon={collapsed ? "mdi:chevron-right" : "mdi:chevron-left"}
          width="18"
          height="18"
          color="white"
        />
      </button>
    </div>
  );
};

export default SideBar;
