import React from "react";
import InsuranceCard from "../../../components/InsuranceCard";

const InsuranceAndTax = ({}) => {
  const insurances = [
    {
      type: "HAF",
      cost: "50",
    },
    {
      type: "GNA",
      cost: "70",
    },
  ];

  return (
    <div className="flex">
      {insurances.map((insurance) => (
        <InsuranceCard
          insuranceType={insurance.type}
          deduction={insurance.cost}
        />
      ))}
    </div>
  );
};

export default InsuranceAndTax;
