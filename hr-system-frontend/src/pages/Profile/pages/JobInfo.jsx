import React, { useEffect, useState } from "react";
import Input from "../../../components/Input";
import "../style.css";
import Button from "../../../components/Button";
import { request } from "../../../common/request";
import Select from "../../../components/Select";
import { toast, ToastContainer } from "react-toastify";

const JobInfo = () => {
  const [jobDetails, setJobDetails] = useState({
    title: "",
    employment_type: "",
    hiring_date: "",
    employment_status: "",
    work_location: "",
    employee_level: "",
  });

  const updateJobDetails = async () => {
    try {
      const response = await request({
        method: "PUT",
        path: "profile/job-details",
        data: { ...jobDetails },
      });
      if (response.success) {
        toast.success("Job Details Updated Successfully");
        getJobDetails();
      }
    } catch {
      toast.error("Failed to update job details");
    }
  };

  const getJobDetails = async () => {
    try {
      const response = await request({
        method: "GET",
        path: "profile/job-details",
      });
      if (response.success) {
        const jd = response.data.job_detail;
        setJobDetails({
          title: jd.title ?? "",
          employment_type: jd.employment_type ?? "",
          hiring_date: jd.hiring_date ?? "",
          employment_status: jd.employment_status ?? "",
          work_location: jd.work_location ?? "",
          employee_level: jd.employee_level ?? "",
        });
      }
    } catch {
      toast.error("Failed to load job details");
    }
  };

  useEffect(() => {
    getJobDetails();
  }, []);

  const options = [
    { value: "junior", label: "Junior" },
    { value: "mid-senior", label: "Mid Junior" },
    { value: "senior", label: "Senior" },
  ];

  return (
    <div className="flex align-center justify-center mt-1">
      <div className="containerP">
        <div className="bg-white p-1 border-rad-eight full-width flex flex-dir-col">
          <h1 className="subtitle">Job Information</h1>
          <ToastContainer />
          <div className="input-container flex justify-center align-center flex-wrap">
            <div className="flex-grow-1">
              <Input
                type={"text"}
                label={"Job Title"}
                placeholder={"Developer"}
                value={jobDetails.title}
                onChange={(e) => setJobDetails({ ...jobDetails, title: e.target.value })}
              />
              <Input
                type={"text"}
                label={"Employment type"}
                placeholder={"Full time"}
                value={jobDetails.employment_type}
                onChange={(e) => setJobDetails({ ...jobDetails, employment_type: e.target.value })}
              />
              <Input
                type={"date"}
                label={"Date of Hiring"}
                value={jobDetails.hiring_date}
                onChange={(e) => setJobDetails({ ...jobDetails, hiring_date: e.target.value })}
              />
              <Input
                type={"text"}
                label={"Employment Status"}
                placeholder={"Employee"}
                value={jobDetails.employment_status}
                onChange={(e) => setJobDetails({ ...jobDetails, employment_status: e.target.value })}
              />
            </div>
            <div className="flex-grow-1">
              <Input
                type={"text"}
                label={"Work Location"}
                placeholder={"On site"}
                value={jobDetails.work_location}
                onChange={(e) => setJobDetails({ ...jobDetails, work_location: e.target.value })}
              />
              <Select
                options={options}
                label="Employment level"
                className={"input select"}
                value={jobDetails.employee_level}
                onChange={(e) => setJobDetails({ ...jobDetails, employee_level: e.target.value })}
              />
            </div>
          </div>
          <Button className="btn-width btn align-self-end" text={"update"} onClick={updateJobDetails} />
        </div>
      </div>
    </div>
  );
};

export default JobInfo;
