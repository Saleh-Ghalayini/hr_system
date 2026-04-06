import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import SubNavBar from "./components/SubNavBar";
import { SUBNAV_CONFIG } from "./common/subNavBarLinks";
import { useAuthContext } from "./context/AuthContext";

const Layout = () => {
  const { user, loading } = useAuthContext();
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const rootPath = `/${pathSegments[1]}`;
  const subPath = pathSegments[2] || "";

  // Get subnav items from config
  const allSubnavItems = SUBNAV_CONFIG[rootPath] || [];
  const subnavItems = allSubnavItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (loading) return true;
    return item.roles.includes(user?.role);
  });

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
