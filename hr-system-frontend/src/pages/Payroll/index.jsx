import React from "react";
import SubNavBar from "../../components/SubNavBar";
import { Routes, Route, Outlet } from "react-router-dom";

const Payroll = () => {
  return (
    <>
    <h1>layout</h1>
      <Outlet />
    </>
  );
};

export default Payroll;
