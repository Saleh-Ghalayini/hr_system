// import React, { useState } from "react";
import logo from "./assets/HR-logo.jpg";
import "./style.css";
import CustomIcon from "../CustomIcon";

const SideBar = ({ activePage, setActivePage }) => {
  const handleIconClick = (iconId) => {
    setActivePage(iconId);
  };
  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <img width={100} height={100} src={logo} alt="logo" />
      </div>
      <div className="sidebar-body">
        <CustomIcon activeIconId={activePage} onIconClick={handleIconClick} />
      </div>
    </div>
  );
};
export default SideBar;
