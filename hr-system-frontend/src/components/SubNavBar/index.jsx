import { Link } from "react-router-dom";
import "./styles.css";

const SubNavBar = ({ basePath, items, activePath }) => {
  return (
    <nav className="subtitle subnavbar">
      <ul className="flex">
        {items.map((item, index) => (
          <li
            key={index}
            className={activePath === item.link ? "activate" : ""}
          >
            <Link to={`${basePath}/${item.link}`}>{item.text}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SubNavBar;
