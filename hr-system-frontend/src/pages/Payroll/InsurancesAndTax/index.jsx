import React, { useEffect, useState } from "react";
import InsuranceCard from "../../../components/InsuranceCard";
import { request } from "../../../common/request";
import InsuranceUpdater from "../../../components/InsuranceUpdater";
import Button from "../../../components/Button";
import "./styles.css";

const InsuranceAndTax = () => {
  const [loading, setLoading] = useState(true);
  const [insuranceData, setInsuranceData] = useState();
  const [trigger, setTrigger] = useState(false);
  const [insuranceType, setInsuranceType] = useState();
  const [value, setValue] = useState();

  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        setLoading(true);
        const response = await request({
          method: "GET",
          path: "admin/getinsurances",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setInsuranceData(response);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsurance();
  }, []);

  const updateInsurance = async () => {
    const response = await request({
      method: "POST",
      path: "admin/updateinsurance",
      data: {
        type: insuranceType,
        value: value,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.success) {
      setTrigger(!trigger);
      window.location.reload();
    }
  };

  return loading ? (
    <h1>Loading</h1>
  ) : (
    <div className="flex">
      {insuranceData.map((insurance) => (
        <InsuranceCard
          insuranceType={insurance.type}
          deduction={insurance.cost}
          onClick={() => {
            setTrigger(!trigger);
            setInsuranceType(insurance.type);
          }}
        />
      ))}
      <div>
        {trigger && (
          <div className="updater">
            <div className="updater-container flex flex-dir-col align-center border-rad-six">
              <header>
                <h2>{insuranceType}</h2>
              </header>
              <input
                type="text"
                className="update-input"
                onChange={(e) => {
                  setValue(e.target.value);
                  console.log(value);
                }}
              />
              <div className="flex actions-btn ">
                <Button
                  text="UPDATE"
                  className="primary-btn"
                  onClick={updateInsurance}
                />
                <Button text="Cancel" className="secondary-btn" onClick={() => setTrigger(!trigger)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceAndTax;
