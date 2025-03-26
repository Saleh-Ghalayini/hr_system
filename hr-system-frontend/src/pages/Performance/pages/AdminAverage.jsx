import { request } from '../../../common/request';
import MyChart from '../../../components/Chart';
import React, { useEffect, useState } from 'react';

const AdminAverage = () => {
    const [averageObjects , setAverageObjects] = useState([]);
    const [averageRateArray ,setAverageRateArray] = useState([1,2,3,4,5,6]);
   
    const rateArray=[];
    const averageRate = async ()=>{
        const token = localStorage.getItem("token");
        const response = await request({
            method: "GET",
            path:"admin/averagerate",
            headers:{
                Authorization : `Bearer ${token}`
           }
        })
        console.log(response.average_ratings)
        if(response.success){
            setAverageObjects(response.average_ratings)
        }
    }
    useEffect(()=>{
        averageRate()
    },[])
    useEffect(()=>{
        averageObjects.map((rate)=>{
           
            rateArray.push(parseFloat(rate.average_rate));
        })
        setAverageRateArray(rateArray)
       
            console.log("rate array", rateArray)
    },[averageObjects])
  
    return (
        <div className='users-container flex flex-dir-col p-1'>
            <h1>Average Rating for Employees</h1>
            <div className="average-chart mt ">
            <MyChart 
                className={"mychart"}
                label={"Employee Average Performance"}
                labelsData={["team work","performance","performance", "performance", "performance",  "comunication"]}
                numericalData={averageRateArray}
                />
            </div>
            
        </div>
    );
};

export default AdminAverage;