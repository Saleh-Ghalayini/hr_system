import React, { useEffect, useState } from 'react';
import Input from '../../../components/Input';
import PieChart from '../../../components/PieChart';
import "./style.css"
import Button from '../../../components/Button';
import { request } from '../../../common/request';
const EmpRate = () => {
    const [rateArray, setRateArray] = useState([]);
    // const [TypesArray, setTypesArray] = useState([]);
    const[rateValue, setValue] = useState({
        teamwork:5,
        comunication:5,
        problemhandling:5,
        collaboration:5,
        creativity:5,
        reliability:5
    })
    
    const getLatestRate = async ()=>{
        const token = localStorage.getItem("token");
        const response = await request({
            method:"GET",
            path:"latestteamrate",
            headers:{
                Authorization : `Bearer ${token}`
              }
        })
        if(response.success){
            const {latest_ratings} = response;
            console.log(latest_ratings);
            setValue({
                teamwork:latest_ratings[0].rate,
                comunication:latest_ratings[1].rate,
                problemhandling:latest_ratings[2].rate,
                collaboration:latest_ratings[3].rate,
                creativity:latest_ratings[4].rate,
                reliability:latest_ratings[5].rate,
            })
        }
    }
    const rateTeam =async ()=>{
        const token = localStorage.getItem("token");
        const response = await request({
            method:"POST",
            path:"rateteam",
            data:{
                "type_ids":[1,2,3,4,5,6],
                "rate": [rateValue.teamwork,rateValue.comunication,rateValue.problemhandling,rateValue.collaboration,rateValue.creativity,rateValue.reliability],
                "comment":"test"
            },
            headers:{
                Authorization : `Bearer ${token}`
              }
        })
        if(response.success){
            console.log(response);
        }
    }
       useEffect(()=>{
        getLatestRate()
    },[])
    return (
        <> 
        <div className='rate-container flex flex-dir-row flex-wrap mt'>

            <div className="inputs-container flex flex-dir-col justify-center align-center flex-grow-1">
              <h2 className='subtitle p-1'> Rate Your Team</h2>
                <div className='flex flex-dir-row flex-wrap flex-grow-1'> 
                    
                <Input
                label={"Team Work"}
                type={"text"}
                value={rateValue.teamwork}
                onChange={(e)=>{
                    e.target.value > 10 ?e.target.value =10 : e.target.value
                    setValue({
                        ...rateValue,
                        teamwork:e.target.value
                    })
                }}
                placeholder={"Rate 1~10"}
                />
                <Input
                label={"Communication"}
                type={"number"}
                value={rateValue.comunication}
                onChange={(e)=>{
                    e.target.value > 10 ?e.target.value =10 : e.target.value
                    setValue({
                        ...rateValue,
                        comunication:e.target.value
                    })
                }}
                placeholder={"Rate 1~10"}
                />
                <Input
                label={"Problem Handiling"}
                type={"text"}
                value={rateValue.problemhandling}
                onChange={(e)=>{
                    e.target.value > 10 ?e.target.value =10 : e.target.value
                    setValue({
                        ...rateValue,
                        problemhandling:e.target.value
                    })
                }}
                placeholder={"Rate 1~10"}
                />
                <Input
                label={"Collaboration"}
                type={"text"}
                value={rateValue.collaboration}
                onChange={(e)=>{
                    e.target.value > 10 ?e.target.value =10 : e.target.value
                    setValue({
                        ...rateValue,
                        collaboration:e.target.value
                    })
                }}
                placeholder={"Rate 1~10"}
                />
                <Input
                label={"Creativity"}
                type={"text"}
                value={rateValue.creativity}
                onChange={(e)=>{
                    e.target.value > 10 ?e.target.value =10 : e.target.value
                    setValue({
                        ...rateValue,
                        creativity:e.target.value
                    })
                }}
                placeholder={"Rate 1~10"}
                /> 
                <Input
                label={"Reliability"}
                type={"text"}
                value={rateValue.reliability}
                onChange={(e)=>{
                    e.target.value > 10 ?e.target.value =10 : e.target.value
                    setValue({
                        ...rateValue,
                        reliability:e.target.value
                    })
                }}
                placeholder={"Rate 1~10"}
                />
                </div>
            <div>
                <Button className='btn' text={"Rate"} onClick={rateTeam}/>
            </div>
            </div>
            <div className="piechart">
                <PieChart label={"Rates"} numircalData={
                 [rateValue.teamwork,rateValue.comunication,rateValue.problemhandling,rateValue.collaboration,rateValue.creativity,rateValue.reliability]} 
                dataLabels={["Team Work","Communication","Problem Handiling","Collaboration","Creativity","Reliability"]}
                />
            </div>
           
        </div>
        </>
    );
};

export default EmpRate;