import React from "react";

const Button = ({
  text,
  onClick,

}) => {
  return (
    <button
      onClick={onClick}
      className={`primary-btn `}
    >
      {text}
    </button>
  );
};

export default Button;