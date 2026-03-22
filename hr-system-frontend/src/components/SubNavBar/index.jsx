import { Link } from "react-router-dom";
import "./styles.css";

const SubNavBar = ({ basePath, items, activePath }) => {
  return (
    <nav className="subnavbar">
      <ul className="subnavbar-list">
        {items.map((item, index) => (
          <li
            key={index}
            className={`subnavbar-item${activePath === item.link ? " activate" : ""}`}
          >
            <Link to={`${basePath}/${item.link}`}>{item.text}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SubNavBar;
