import React, { useEffect, useState } from "react";
import InsuranceCard from "../../../components/InsuranceCard";
import { request } from "../../../common/request";
import Button from "../../../components/Button";
import "./styles.css";

const InsuranceAndTax = () => {
  const [loading, setLoading] = useState(true);
  const [insuranceData, setInsuranceData] = useState([]);
  const [trigger, setTrigger] = useState(false);
  const [insuranceId, setInsuranceId] = useState(null);
  const [insuranceType, setInsuranceType] = useState("");
  const [value, setValue] = useState("");

  const fetchInsurance = async () => {
    try {
      setLoading(true);
      const response = await request({
        method: "GET",
        path: "admin/insurances",
      });
      setInsuranceData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsurance();
  }, []);

  const updateInsurance = async () => {
    try {
      const response = await request({
        method: "PUT",
        path: `admin/insurances/${insuranceId}`,
        data: { value: parseFloat(value) },
      });

      if (response.success) {
        setTrigger(false);
        setValue("");
        fetchInsurance();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="flex">
      {insuranceData.map((insurance) => (
        <InsuranceCard
          key={insurance.id}
          insuranceType={insurance.type}
          deduction={insurance.cost}
          onClick={() => {
            setTrigger(true);
            setInsuranceId(insurance.id);
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
                type="number"
                className="update-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <div className="flex actions-btn">
                <Button
                  text="UPDATE"
                  className="primary-btn"
                  onClick={updateInsurance}
                />
                <Button
                  text="Cancel"
                  className="secondary-btn"
                  onClick={() => { setTrigger(false); setValue(""); }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceAndTax;
