import React from "react";
import { Outlet } from "react-router-dom";
const Training = () => {
  // <Route path="/enrollment" element={<Enrollment />} />

  return (
    <>
      <Outlet />
    </>
  );
};

export default Training;
