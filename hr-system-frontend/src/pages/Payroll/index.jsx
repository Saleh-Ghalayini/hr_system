import React from "react";
import SubNavBar from "../../components/SubNavBar";
import { Routes, Route } from "react-router-dom";

const Payroll = () => {
  return (
    <>
      <SubNavBar
        baseLink="/payroll"
        text1="Salaries"
        link1=""
        text2="Insurance & Tax"
        link2="/insurancetax"
        text3="Bonuses"
        link3="/bonuses"
      />

      <Routes>
        <Route path="/" element={<h1>salaries</h1>} />
        <Route path="/salaries" element={<h1>bonuses</h1>} />
      </Routes>
    </>
  );
};

export default Payroll;
