import React from 'react'
import { Outlet } from 'react-router-dom';
import "./pages/style.css";
const Performance = () => {
  return (
    <>
    <div className='perfobody'> 
      <Outlet />
    </div>
    </>
  );
};


export default Performance