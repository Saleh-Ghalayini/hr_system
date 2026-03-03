import React, { useEffect, useState } from "react";
import Input from "../../../components/Input";
import "../style.css";
import Button from "../../../components/Button";
import { request } from "../../../common/request";
import { toast, ToastContainer } from "react-toastify";

const BasicInfo = () => {
  const ImageBaseUrl = import.meta.env.VITE_Image_Base_URL;
  const [base64Image, setBase64Image] = useState("");
  const [basicInfo, setBasicInfo] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    nationality: "",
    contactNumber: "",
    gender: "",
    Address: "",
    profile_url: "/logo.png",
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setBase64Image(reader.result);
  };

  const uploadImg = async () => {
    try {
      const response = await request({
        method: "POST",
        path: "profile/photo",
        data: { image: base64Image },
      });
      if (response.success) {
        setBase64Image("");
        getBasicInfo();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getBasicInfo = async () => {
    try {
      const response = await request({
        method: "GET",
        path: "profile/job-details",
      });
      if (response.success) {
        const u = response.data.user;
        setBasicInfo({
          firstName: u.first_name ?? "",
          lastName: u.last_name ?? "",
          dob: u.date_of_birth ?? "",
          email: u.email ?? "",
          nationality: u.nationality ?? "",
          contactNumber: u.phone_number ?? "",
          gender: u.gender ?? "",
          Address: u.address ?? "",
          profile_url: u.profile_url ? ImageBaseUrl + u.profile_url : "/logo.png",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateBasicInfo = async () => {
    try {
      const response = await request({
        method: "PUT",
        path: "profile/basic-info",
        data: {
          first_name: basicInfo.firstName,
          last_name: basicInfo.lastName,
          date_of_birth: basicInfo.dob,
          email: basicInfo.email,
          nationality: basicInfo.nationality,
          phone_number: basicInfo.contactNumber,
          gender: basicInfo.gender,
          address: basicInfo.Address,
        },
      });
      if (response.success) {
        toast.success("Basic Info Updated Successfully");
        getBasicInfo();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getBasicInfo();
  }, []);

  return (
    <div className="flex align-center justify-center mt-1">
      <div className="containerP">
        <div className="photo-container flex felx-dir-row align-center flex-wrap border-rad-eight p-1">
          <img src={basicInfo.profile_url} alt="profile photo" id="profImg" />
          <Input type={"file"} label={"Photo"} onChange={handleImageChange} />
          <Button className="btn btn-width" text={"update"} onClick={uploadImg} />
        </div>

        <div className="bg-white p-1 border-rad-eight full-width flex flex-dir-col">
          <h1 className="subtitle">Basic Information</h1>
          <div className="input-container flex justify-center align-center flex-wrap">
            <div className="flex-grow-1">
              <Input
                type={"text"}
                label={"First Name"}
                placeholder={"First name"}
                value={basicInfo.firstName}
                onChange={(e) => setBasicInfo({ ...basicInfo, firstName: e.target.value })}
              />
              <Input
                type={"text"}
                label={"Last Name"}
                placeholder={"Last name"}
                value={basicInfo.lastName}
                onChange={(e) => setBasicInfo({ ...basicInfo, lastName: e.target.value })}
              />
              <Input
                type={"date"}
                label={"Date of Birth"}
                value={basicInfo.dob}
                onChange={(e) => setBasicInfo({ ...basicInfo, dob: e.target.value })}
              />
              <Input
                type={"text"}
                label={"Email"}
                placeholder={"Example@gmail.com"}
                value={basicInfo.email}
                onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
              />
            </div>
            <div className="flex-grow-1">
              <Input
                type={"text"}
                label={"Nationality"}
                placeholder={"Nationality"}
                value={basicInfo.nationality}
                onChange={(e) => setBasicInfo({ ...basicInfo, nationality: e.target.value })}
              />
              <Input
                type={"text"}
                label={"Contact Number"}
                placeholder={"Phone number"}
                value={basicInfo.contactNumber}
                onChange={(e) => setBasicInfo({ ...basicInfo, contactNumber: e.target.value })}
              />
              <Input
                type={"text"}
                label={"Gender"}
                placeholder={"Gender"}
                value={basicInfo.gender}
                onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
              />
              <Input
                type={"text"}
                label={"Address"}
                placeholder={"Address"}
                value={basicInfo.Address}
                onChange={(e) => setBasicInfo({ ...basicInfo, Address: e.target.value })}
              />
            </div>
          </div>
          <Button className="btn-width btn align-self-end" onClick={updateBasicInfo} text={"update"} />
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
