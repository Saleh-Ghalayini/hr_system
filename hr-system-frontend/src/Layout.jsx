import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import SubNavBar from "./components/SubNavBar";
import { SUBNAV_CONFIG } from "./common/subNavBarLinks";

const Layout = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const rootPath = `/${pathSegments[1]}`;
  const subPath = pathSegments[2] || "";

  // Get subnav items from config
  const subnavItems = SUBNAV_CONFIG[rootPath] || [];

  return (
    <div className="app-layout">
      <SideBar activePage={rootPath} />
      <div className="col">
        <NavBar />
        {subnavItems.length > 0 && (
          <SubNavBar
            basePath={rootPath}
            items={subnavItems}
            activePath={subPath}
          />
        )}
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
