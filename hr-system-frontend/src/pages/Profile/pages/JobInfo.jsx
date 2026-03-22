import React, { useEffect, useState } from "react";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import "../style.css";
import Button from "../../../components/Button";
import { request } from "../../../common/request";
import { toast } from "react-toastify";

const LEVEL_OPTIONS = [
  { value: "", label: "-- Select level --" },
  { value: "junior", label: "Junior" },
  { value: "mid-senior", label: "Mid-Senior" },
  { value: "senior", label: "Senior" },
];

const TYPE_OPTIONS = [
  { value: "", label: "-- Select type --" },
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Intern", label: "Intern" },
];

const STATUS_OPTIONS = [
  { value: "", label: "-- Select status --" },
  { value: "Active", label: "Active" },
  { value: "On Leave", label: "On Leave" },
  { value: "Terminated", label: "Terminated" },
];

const LOCATION_OPTIONS = [
  { value: "", label: "-- Select location --" },
  { value: "On-site", label: "On-site" },
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
];

const JobInfo = () => {
  const [jobDetails, setJobDetails] = useState({
    title: "", employment_type: "", hiring_date: "",
    employment_status: "", work_location: "", employee_level: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setJobDetails((p) => ({ ...p, [key]: e.target.value }));

  const updateJobDetails = async () => {
    setSaving(true);
    try {
      const response = await request({
        method: "PUT", path: "profile/job-details", data: { ...jobDetails },
      });
      if (response.success) toast.success("Job details saved!");
      else toast.error("Failed to save changes.");
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const getJobDetails = async () => {
    try {
      const response = await request({ method: "GET", path: "profile/job-details" });
      if (response.success) {
        const jd = response.data.job_detail;
        setJobDetails({
          title: jd.title ?? "", employment_type: jd.employment_type ?? "",
          hiring_date: jd.hiring_date ?? "", employment_status: jd.employment_status ?? "",
          work_location: jd.work_location ?? "", employee_level: jd.employee_level ?? "",
        });
      }
    } catch {
      toast.error("Failed to load job details");
    }
  };

  useEffect(() => { getJobDetails(); }, []);

  return (
    <div className="profilebody">
      <div className="containerP">
        <div className="profile-card">
          <p className="profile-card-title">Job Information</p>
          <div className="input-grid">
            <Input type="text" label="Job Title" placeholder="e.g. Software Developer"
              value={jobDetails.title} onChange={set("title")} />
            <Select label="Work Location" value={jobDetails.work_location}
              onChange={set("work_location")} options={LOCATION_OPTIONS} />
            <Select label="Employment Type" value={jobDetails.employment_type}
              onChange={set("employment_type")} options={TYPE_OPTIONS} />
            <Select label="Employee Level" value={jobDetails.employee_level}
              onChange={set("employee_level")} options={LEVEL_OPTIONS} />
            <Input type="date" label="Date of Hiring"
              value={jobDetails.hiring_date} onChange={set("hiring_date")} />
            <Select label="Employment Status" value={jobDetails.employment_status}
              onChange={set("employment_status")} options={STATUS_OPTIONS} />
          </div>
          <div className="form-actions">
            <Button text={saving ? "Saving..." : "Save Changes"} onClick={updateJobDetails} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobInfo;
