import React from "react";
import "./styles.css";
import { Link, useLocation } from "react-router-dom";

const SubNavBar = (props) => {
  const location = useLocation();
  const baseUrl = props.baseLink;
  const texts = [
    props.text1,
    props.text2,
    props.text3,
    props.text4,
    props.text5,
    props.text6,
  ];
  const links = [
    props.link1,
    props.link2,
    props.link3,
    props.link4,
    props.link5,
    props.link6,
  ];

  console.log(baseUrl + links[0]);
  const CustomLink = ({ text, link }) => {
    const currentPath = location.pathname;

    return (
      <li className={currentPath === baseUrl + link ? "activate" : ""}>
        <Link to={baseUrl + link}>{text}</Link>
      </li>
    );
  };

  return (
    <nav className=" subtitle subnavbar">
      <ul className="flex">
        <CustomLink text={texts[0]} link={links[0]}></CustomLink>
        <CustomLink text={texts[1]} link={links[1]}></CustomLink>
        <CustomLink text={texts[2]} link={links[2]}></CustomLink>
        <CustomLink text={texts[3]} link={links[3]}></CustomLink>
        <CustomLink text={texts[4]} link={links[4]}></CustomLink>
        <CustomLink text={texts[5]} link={links[5]}></CustomLink>
      </ul>
    </nav>
  );
};

export default SubNavBar;
