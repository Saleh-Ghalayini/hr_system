import React from "react";
import { useState } from "react";
import "./styles.css";
import Button from "../Button";
import { request } from "../../common/request";

const InsuranceUpdater = (props) => {
  const [value, setValue] = useState();
  const [trigger, SetTrigger] = useState(true);

  const updateInsurance = async () => {
    const response = await request({
      method: "POST",
      path: "admin/updateinsurance",
      data: {
        type: props.insuranceType,
        value: value,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.success) {
      SetTrigger(false);
    }
  };

  return props.trigger ? (
    <div className="updater">
      <div className="updater-container flex flex-dir-col align-center border-rad-six">
        <header>
          <h2>{props.insuranceType}</h2>
        </header>
        <input
          type="text"
          className="update-input"
          onChange={(e) => {
            setValue(e.target.value);
            console.log(value);
          }}
        />
        <Button
          text="UPDATE"
          className="primary-btn"
          onClick={() => {
            updateInsurance();
            SetTrigger(false);
          }}
        />
      </div>
    </div>
  ) : (
    ""
  );
};

export default InsuranceUpdater;
