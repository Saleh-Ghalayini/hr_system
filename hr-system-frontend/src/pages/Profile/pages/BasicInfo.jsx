import React, { useEffect, useRef, useState } from "react";
import Input from "../../../components/Input";
import "../style.css";
import Button from "../../../components/Button";
import { request } from "../../../common/request";
import { toast } from "react-toastify";

const BasicInfo = () => {
  const ImageBaseUrl = import.meta.env.VITE_Image_Base_URL;
  const [base64Image, setBase64Image] = useState("");
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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl((prev) => { if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev); return objectUrl; });
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setBase64Image(reader.result);
  };

  const uploadImg = async () => {
    if (!base64Image) { toast.info("Please select a photo first."); return; }
    setUploading(true);
    try {
      const response = await request({ method: "POST", path: "profile/photo", data: { image: base64Image } });
      if (response.success) {
        const photoUrl = response.data?.photo_url;
        toast.success("Photo updated successfully!");
        setBase64Image("");
        if (photoUrl) {
          setPreviewUrl(photoUrl);
          // Notify other components (e.g. NavBar) that the photo was updated
          window.dispatchEvent(new CustomEvent("photo-updated", { detail: photoUrl }));
        }
      } else {
        toast.error("Failed to upload photo.");
      }
    } catch {
      toast.error("Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const getBasicInfo = async () => {
    try {
      const response = await request({ method: "GET", path: "profile/job-details" });
      if (response.success) {
        const u = response.data.user;
        const url = u.profile_url ? ImageBaseUrl + u.profile_url : "/logo.png";
        setBasicInfo({
          firstName: u.first_name ?? "", lastName: u.last_name ?? "",
          dob: u.date_of_birth ?? "", email: u.email ?? "",
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
      if (response.success) toast.success("Profile saved successfully!");
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
                onChange={handleImageChange}
              />
              <Button
                text="Choose Photo"
                className=""
                onClick={() => fileRef.current?.click()}
              />
              {base64Image && (
                <Button
                  text={uploading ? "Uploading…" : "Upload Photo"}
                  className=""
                  onClick={uploadImg}
                />
              )}
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
            <Input type="text" label="Gender" placeholder="Gender"
              value={basicInfo.gender} onChange={set("gender")} />
            <Input type="text" label="Email" placeholder="you@example.com"
              value={basicInfo.email} onChange={set("email")} />
            <Input type="text" label="Address" placeholder="Address"
              value={basicInfo.Address} onChange={set("Address")} />
          </div>
          <div className="form-actions">
            <Button text={saving ? "Saving…" : "Save Changes"} onClick={updateBasicInfo} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default BasicInfo;
