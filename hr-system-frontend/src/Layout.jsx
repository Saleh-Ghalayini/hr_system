import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";

const Layout = () => (
  <div className="flex">
    <SideBar />
    <div className="col">
      <NavBar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  </div>
);

export default Layout;