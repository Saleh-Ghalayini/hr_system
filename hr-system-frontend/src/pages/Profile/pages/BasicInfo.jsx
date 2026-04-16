import React, { useEffect, useState } from "react";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import "../style.css";
import Button from "../../../components/Button";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import { useAuthContext } from "../../../context/AuthContext";

const GENDER_OPTIONS = [
  { value: "", label: "— Select gender —" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
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

const BasicInfo = () => {
  const { user } = useAuthContext();
  const isAdmin = user?.role === "admin";

  const [saving, setSaving] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    firstName: "", lastName: "", dob: "", email: "",
    nationality: "", contactNumber: "", gender: "", address: "",
  });

  const set = (key) => (e) => setBasicInfo((p) => ({ ...p, [key]: e.target.value }));

  const getBasicInfo = async () => {
    try {
      const response = await request({ method: "GET", path: "profile/job-details" });
      if (response.success) {
        const u = response.data.user;
        setBasicInfo({
          firstName: u.first_name ?? "",
          lastName: u.last_name ?? "",
          dob: normalizeDateForInput(u.date_of_birth),
          email: u.email ?? "",
          nationality: u.nationality ?? "",
          contactNumber: u.phone_number ?? "",
          gender: u.gender ?? "",
          address: u.address ?? "",
        });
      }
    } catch {
      // silently fail
    }
  };

  const updateBasicInfo = async () => {
    setSaving(true);
    try {
      const response = await request({
        method: "PUT", path: "profile/basic-info",
        data: {
          first_name: basicInfo.firstName,
          last_name: basicInfo.lastName,
          date_of_birth: basicInfo.dob,
          email: basicInfo.email,
          nationality: basicInfo.nationality,
          phone_number: basicInfo.contactNumber,
          gender: basicInfo.gender,
          address: basicInfo.address,
        },
      });
      if (response.success) toast.success("Profile saved!");
      else toast.error("Failed to save changes.");
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to save changes.";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { getBasicInfo(); }, []);

  return (
    <div className="profilebody">
      <div className="containerP">
        <div className="profile-card">
          <p className="profile-card-title">Basic Information</p>
          <div className="input-grid">
            <Input
              type="text"
              label="First Name"
              placeholder="First name"
              value={basicInfo.firstName}
              onChange={set("firstName")}
              readonly={!isAdmin}
            />
            <Input
              type="text"
              label="Nationality"
              placeholder="Nationality"
              value={basicInfo.nationality}
              onChange={set("nationality")}
              readonly={!isAdmin}
            />
            <Input
              type="text"
              label="Last Name"
              placeholder="Last name"
              value={basicInfo.lastName}
              onChange={set("lastName")}
              readonly={!isAdmin}
            />
            <Input
              type="text"
              label="Contact Number"
              placeholder="Phone number"
              value={basicInfo.contactNumber}
              onChange={set("contactNumber")}
              readonly={!isAdmin}
            />
            <Input
              type="date"
              label="Date of Birth"
              value={basicInfo.dob}
              onChange={set("dob")}
              readonly={!isAdmin}
            />
            <Select
              label="Gender"
              value={basicInfo.gender}
              onChange={set("gender")}
              options={GENDER_OPTIONS}
              disabled={!isAdmin}
            />
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={basicInfo.email}
              onChange={set("email")}
              readonly={!isAdmin}
            />
            <Input
              type="text"
              label="Address"
              placeholder="Address"
              value={basicInfo.address}
              onChange={set("address")}
              readonly={!isAdmin}
            />
          </div>
          {isAdmin && (
            <div className="form-actions">
              <Button text={saving ? "Saving..." : "Save Changes"} onClick={updateBasicInfo} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
