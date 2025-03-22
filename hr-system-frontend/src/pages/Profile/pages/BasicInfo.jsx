import React, { useState } from "react";
import Input from "../../../components/Input";
import "../style.css";
import Button from "../../../components/Button";
import { request } from "../../../common/request";
const BasicInfo = () => {
  const [name, setName] = useState("");
 
  const [base64Image, setBase64Image] = useState("");
  // Function to Convert Image to Base64
  const handleImageChange = (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file); // Convert to Base64
    reader.onload = () => setBase64Image(reader.result); // Store Base64 string
    reader.onerror = (error) => console.log("Error:", error);
  //  console.log(reader)
  };
  const uploadImg = async()=>{
    const token = localStorage.getItem("token");
    console.log(token)
    const response = await request({
        method:"POST",
        path:"uploadphoto",
        data:{
            image:base64Image,
        },
        headers:{
          Authorization : `Bearer ${token}`
        }
    })
    console.log(response)
   if(response.success){
    setBase64Image("")
    
   }

  }
  return (
    <div className="flex align-center justify-center mt-1">
      <div className="containerP">
        <div className="photo-container flex felx-dir-row  align-center flex-wrap border-rad-eight p-1">
          <img src="/logo.png" alt="picture photo" id="profImg" />
          <Input
            type={"file"}
            label={"Photo"}
            placeholder={"Hasan"}
           
            onChange={
              handleImageChange
            }
          />
          <Button className="btn btn-width" text={"update"} onClick={uploadImg}/>
        </div>

        <div className="bg-white p-1 border-rad-eight full-width flex flex-dir-col">
          <h1 className="subtitle">Basic Information</h1>
          <div className="input-container flex justify-center align-center flex-wrap">
            <div className="flex-grow-1">
              <Input
                type={"text"}
                label={"First Name"}
                placeholder={"Hasan"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <Input
                type={"text"}
                label={"Last Name"}
                placeholder={"Mawassi"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <Input
                type={"date"}
                label={"Date of Birth"}
                placeholder={""}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <Input
                type={"text"}
                label={"Email"}
                placeholder={"Example@gmail.com"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <div className="flex-grow-1">
              <Input
                type={"text"}
                label={"Nationality"}
                placeholder={"Lebanese"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <Input
                type={"text"}
                label={"Contact Number"}
                placeholder={"70111111"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <Input
                type={"text"}
                label={"Gender"}
                placeholder={"Male"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <Input
                type={"text"}
                label={"Address"}
                placeholder={"Beruit"}
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

export default BasicInfo;
