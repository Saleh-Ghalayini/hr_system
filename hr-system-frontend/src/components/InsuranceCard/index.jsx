import React from "react";
import "./styles.css";
import Button from "../Button";

const InsuranceCard = ({ insuranceType, deduction }) => {
  return (
    <div className="insurance-card flex flex-dir-col align-center m-1 border-rad-six">
      <header>
        <h2 className="subtitle">{insuranceType}</h2>
      </header>

      <h3 className="lato">Deduction Amount:</h3>
      <h3 className="lato">{deduction}$</h3>
      <Button className="insurance-btn" text="UPDATE" />
    </div>
  );
};

export default InsuranceCard;
