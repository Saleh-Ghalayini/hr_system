import React from 'react';
import Input from '../../../components/Input';
import PieChart from '../../../components/PieChart';
import "./style.css"
import Button from '../../../components/Button';

const EmpRate = () => {
    return (
        <> 
        <div className='rate-container flex flex-dir-row flex-wrap mt'>

            <div className="inputs-container flex flex-dir-col justify-center align-center flex-grow-1">
              <h2 className='subtitle p-1'> Rate Your Team</h2>
                <div className='flex flex-dir-row flex-wrap flex-grow-1'> 
                <Input
                label={"work"}
                type={"text"}
                placeholder={"Rate 1~10"}
                />
                <Input
                label={"work"}
                type={"text"}
                placeholder={"Rate 1~10"}
                />
                <Input
                label={"work"}
                type={"text"}
                placeholder={"Rate 1~10"}
                />
                <Input
                label={"work"}
                type={"text"}
                placeholder={"Rate 1~10"}
                />
                <Input
                label={"work"}
                type={"text"}
                placeholder={"Rate 1~10"}
                /> 
                <Input
                label={"work"}
                type={"text"}
                placeholder={"Rate 1~10"}
                />
                </div>
            <div>
                <Button className='btn' text={"update"}/>
            </div>
            </div>
            <div className="piechart">
                <PieChart label={"Rates"} numircalData={[12,4,6,8,3]} 
                dataLabels={["team word","team word","team word","team word","team word"]}
                />
            </div>
           
        </div>
        </>
    );
};

export default EmpRate;