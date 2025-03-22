import React, { useState } from "react";
import Input from "../../../components/Input";
import "../style.css";
import Button from "../../../components/Button";

const JobInfo = () => {
  const [name, setName] = useState("");

  return (
    <div className="flex align-center justify-center mt-1">
      <div className="containerP">
        <div className="bg-white p-1 border-rad-eight full-width flex flex-dir-col">
          <h1 className="subtitle">Job Information</h1>
          <div className="input-container flex justify-center align-center flex-wrap ">
            <div className="flex-grow-1">
              <Input
                type={"text"}
                label={"Job Title"}
                placeholder={"Developer"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <Input
                type={"text"}
                label={"Employment type"}
                placeholder={"full time"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <Input
                type={"date"}
                label={"Date of Hiring"}
                placeholder={""}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <Input
                type={"text"}
                label={"Employment Status"}
                placeholder={"Example@gmail.com"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <div className="flex-grow-1 ">
              <Input
                type={"text"}
                label={"Work Location"}
                placeholder={"on Site"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <Input
                type={"text"}
                label={"Employe Level"}
                placeholder={"Senior"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
          </div>
          <Button className="btn-width btn  align-self-end" text={"update"} />
        </div>
      </div>
    </div>
  );
};

export default JobInfo;
