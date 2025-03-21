// import React, { useState } from "react";
import logo from "./assets/HR-logo.jpg";
import "./style.css";
import CustomIcon from "../CustomIcon";

const SideBar = ({ activePage }) => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <img width={80} height={80} src={logo} alt="logo" />
      </div>
      <div className="sidebar-body">
        <CustomIcon activeIconId={activePage} />
      </div>
    </div>
  );
};
export default SideBar;
