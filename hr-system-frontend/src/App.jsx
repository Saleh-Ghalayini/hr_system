import { useState } from "react";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import "./index.css";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  return (
    <>
      <div className="flex">
        <SideBar
          className="sidebar"
          activePage={activePage}
          setActivePage={setActivePage}
        />
        <div className="col">
          <NavBar title={activePage} className="grow" />
          <div className="main-content">
            {activePage === "Dashboard" ? (
              <div className="subnav" ></div>
            ) : activePage === "Attendance" ?   (
              <h1>Welcome to the HR Attendance</h1>
            ) : activePage === "Onboarding" ? (
              <h1>Welcome to the HR Onboarding</h1>
            ) : activePage === "Training" ? (
              <Training />
            ) : activePage === "Performance" ? (
              <h1>Welcome to the HR Performance</h1>
            ) : activePage === "Payroll" ? (
              <h1>Welcome to the HR Payroll</h1>
            ) : activePage === "Reports" ? (
              <h1>Welcome to the HR Reports</h1>
            ) : (
              <h1>Welcome to the HR System</h1>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
export default App;
