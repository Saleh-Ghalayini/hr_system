import React, { useEffect, useState } from "react";
import Input from "../../../components/Input";
import "../style.css";
import Button from "../../../components/Button";
import { request } from "../../../common/request";
import { toast, ToastContainer } from "react-toastify";

const LEVEL_OPTIONS = ["junior", "mid-senior", "senior"];

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
      if (response.success) toast.success("Job details saved successfully!");
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
      <ToastContainer />
      <div className="containerP">
        <div className="profile-card">
          <p className="profile-card-title">Job Information</p>
          <div className="input-grid">
            <Input type="text" label="Job Title" placeholder="e.g. Software Developer"
              value={jobDetails.title} onChange={set("title")} />
            <Input type="text" label="Work Location" placeholder="e.g. On-site"
              value={jobDetails.work_location} onChange={set("work_location")} />
            <Input type="text" label="Employment Type" placeholder="e.g. Full-time"
              value={jobDetails.employment_type} onChange={set("employment_type")} />

            {/* Employee Level — native select styled to match Input */}
            <div className="input-label flex flex-dir-col align-center">
              <label className="small-text label">Employee Level</label>
              <select
                value={jobDetails.employee_level}
                onChange={set("employee_level")}
              >
                <option value="">— Select level —</option>
                {LEVEL_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <Input type="date" label="Date of Hiring"
              value={jobDetails.hiring_date} onChange={set("hiring_date")} />
            <Input type="text" label="Employment Status" placeholder="e.g. Active"
              value={jobDetails.employment_status} onChange={set("employment_status")} />
          </div>
          <div className="form-actions">
            <Button text={saving ? "Saving…" : "Save Changes"} onClick={updateJobDetails} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobInfo;
