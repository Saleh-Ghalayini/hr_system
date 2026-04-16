import React, { useEffect, useState } from "react";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import "../style.css";
import Button from "../../../components/Button";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import { useAuthContext } from "../../../context/AuthContext";

const LEVEL_OPTIONS = [
  { value: "", label: "-- Select level --" },
  { value: "junior", label: "Junior" },
  { value: "mid-senior", label: "Mid-Senior" },
  { value: "senior", label: "Senior" },
];

const TYPE_OPTIONS = [
  { value: "", label: "-- Select type --" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const STATUS_OPTIONS = [
  { value: "", label: "-- Select status --" },
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On Leave" },
  { value: "terminated", label: "Terminated" },
];

const LOCATION_OPTIONS = [
  { value: "", label: "-- Select location --" },
  { value: "on_site", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const normalizeDateForInput = (value) => {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value).slice(0, 10);
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const JobInfo = () => {
  const { user } = useAuthContext();
  const isAdmin = user?.role === "admin";

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
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to save changes.";
      toast.error(errorMsg);
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
          hiring_date: normalizeDateForInput(jd.hiring_date), employment_status: jd.employment_status ?? "",
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
              value={jobDetails.title} onChange={set("title")} readonly={!isAdmin} />
            <Select label="Work Location" value={jobDetails.work_location}
              onChange={set("work_location")} options={LOCATION_OPTIONS} disabled={!isAdmin} />
            <Select label="Employment Type" value={jobDetails.employment_type}
              onChange={set("employment_type")} options={TYPE_OPTIONS} disabled={!isAdmin} />
            <Select label="Employee Level" value={jobDetails.employee_level}
              onChange={set("employee_level")} options={LEVEL_OPTIONS} disabled={!isAdmin} />
            <Input type="date" label="Date of Hiring"
              value={jobDetails.hiring_date} onChange={set("hiring_date")} readonly={!isAdmin} />
            <Select label="Employment Status" value={jobDetails.employment_status}
              onChange={set("employment_status")} options={STATUS_OPTIONS} disabled={!isAdmin} />
          </div>
          {isAdmin && (
            <div className="form-actions">
              <Button text={saving ? "Saving..." : "Save Changes"} onClick={updateJobDetails} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobInfo;
