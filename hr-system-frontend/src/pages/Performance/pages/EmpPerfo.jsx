import React, { useEffect, useState } from 'react';
import MyChart from '../../../components/Chart';
import "./style.css"
import { request } from '../../../common/request';
const EmpPerfo = () => {
    const [rates ,setRates] = useState([5,5,5,5,5,5]);
    const [comment, setComment] = useState("Feed baxk from you manager");
    const [average , setAverage] = useState(4);
    const getRate = async()=>{
         const token = localStorage.getItem("token");
                const response = await request({
                    method:"GET",
                    path:"getemplyeerate",
                    headers:{
                        Authorization : `Bearer ${token}`
                      }
                })
                if(response?.success){
                    setRates(response.rates);
                    setComment(response.comment);
                    const avg = rates.reduce((sum, value) => sum + value, 0) / rates.length;
                 const  rounded= avg.toFixed(2)                   
                  setAverage(rounded);
                }
    }
    useEffect(()=>{
        getRate()
    },[])
    return (
        <div className='performnce-container flex flex-dir-row p-1'>
            <div  className='chart'>
                <MyChart 
                className={"mychart"}
                label={"Employee Performance"}
                labelsData={["team work","performance","performance", "performance", "performance",  "comunication"]}
                numericalData={rates}
                />
            </div>
            <div className="rate-comment flex flex-dir-col p-1">
                <div className="rate">
                    <h3>Average Rate <span>{average}</span></h3>
                </div>
                <div className='comment flex flex-dir-col'> 
                <h3>feedback</h3>
                    <p className="comment-text">
                       {comment}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmpPerfo;