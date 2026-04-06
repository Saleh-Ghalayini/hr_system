import React, { useEffect, useRef, useState } from "react";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import "../style.css";
import Button from "../../../components/Button";
import { request } from "../../../common/request";
import { toast } from "react-toastify";

const GENDER_OPTIONS = [
  { value: "", label: "— Select gender —" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const normalizeDateForInput = (value) => {
  if (!value) return "";

  // Already normalized by backend or raw date input.
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
  const ImageBaseUrl = import.meta.env.VITE_Image_Base_URL;
  const [previewUrl, setPreviewUrl] = useState("/logo.png");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const [basicInfo, setBasicInfo] = useState({
    firstName: "", lastName: "", dob: "", email: "",
    nationality: "", contactNumber: "", gender: "", Address: "",
    profile_url: "/logo.png",
  });

  const set = (key) => (e) => setBasicInfo((p) => ({ ...p, [key]: e.target.value }));

  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate size (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image exceeds the 2 MB size limit.");
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl((prev) => { if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev); return objectUrl; });

    // Convert to base64 and upload automatically
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setUploading(true);
      try {
        const response = await request({ method: "POST", path: "profile/photo", data: { image: base64Image } });
        if (response.success) {
          const photoUrl = response.data?.photo_url;
          toast.success("Photo updated!");
          if (photoUrl) {
            setPreviewUrl(photoUrl);
            window.dispatchEvent(new CustomEvent("photo-updated", { detail: photoUrl }));
          }
        } else {
          toast.error("Failed to upload photo.");
        }
      } catch {
        toast.error("Failed to upload photo.");
      } finally {
        setUploading(false);
        // Reset file input so the same file can be re-selected
        if (fileRef.current) fileRef.current.value = "";
      }
    };
  };

  const getBasicInfo = async () => {
    try {
      const response = await request({ method: "GET", path: "profile/job-details" });
      if (response.success) {
        const u = response.data.user;
        const url = u.profile_url ? ImageBaseUrl + u.profile_url : "/logo.png";
        setBasicInfo({
          firstName: u.first_name ?? "", lastName: u.last_name ?? "",
          dob: normalizeDateForInput(u.date_of_birth), email: u.email ?? "",
          nationality: u.nationality ?? "", contactNumber: u.phone_number ?? "",
          gender: u.gender ?? "", Address: u.address ?? "", profile_url: url,
        });
        setPreviewUrl(url);
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
          first_name: basicInfo.firstName, last_name: basicInfo.lastName,
          date_of_birth: basicInfo.dob, email: basicInfo.email,
          nationality: basicInfo.nationality, phone_number: basicInfo.contactNumber,
          gender: basicInfo.gender, address: basicInfo.Address,
        },
      });
      if (response.success) toast.success("Profile saved!");
      else toast.error("Failed to save changes.");
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { getBasicInfo(); }, []);

  return (
    <div className="profilebody">
      <div className="containerP">

        {/* Photo card */}
        <div className="profile-card">
          <p className="profile-card-title">Profile Photo</p>
          <div className="photo-section">
            <img src={previewUrl} alt="Profile" className="photo-avatar"
              onError={(e) => { e.target.src = "/logo.png"; }} />
            <div className="photo-actions">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageSelect}
              />
              <Button
                text={uploading ? "Uploading..." : "Change Photo"}
                className=""
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              />
              <p className="photo-hint">JPG, PNG or GIF — max 2 MB</p>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="profile-card">
          <p className="profile-card-title">Basic Information</p>
          <div className="input-grid">
            <Input type="text" label="First Name" placeholder="First name"
              value={basicInfo.firstName} onChange={set("firstName")} />
            <Input type="text" label="Nationality" placeholder="Nationality"
              value={basicInfo.nationality} onChange={set("nationality")} />
            <Input type="text" label="Last Name" placeholder="Last name"
              value={basicInfo.lastName} onChange={set("lastName")} />
            <Input type="text" label="Contact Number" placeholder="Phone number"
              value={basicInfo.contactNumber} onChange={set("contactNumber")} />
            <Input type="date" label="Date of Birth"
              value={basicInfo.dob} onChange={set("dob")} />
            <Select
              label="Gender"
              value={basicInfo.gender}
              onChange={set("gender")}
              options={GENDER_OPTIONS}
            />
            <Input type="text" label="Email" placeholder="you@example.com"
              value={basicInfo.email} onChange={set("email")} />
            <Input type="text" label="Address" placeholder="Address"
              value={basicInfo.Address} onChange={set("Address")} />
          </div>
          <div className="form-actions">
            <Button text={saving ? "Saving..." : "Save Changes"} onClick={updateBasicInfo} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default BasicInfo;
