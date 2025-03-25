import React from 'react';
import MyChart from '../../../components/Chart';
import "./style.css"
const EmpPerfo = () => {
    return (
        <div className='performnce-container flex flex-dir-row p-1'>
            <div  className='chart'>
                <MyChart 
                className={"mychart"}
                label={"Employee Performance"}
                labelsData={["team work","performance","performance", "performance", "performance",  "comunication"]}
                numericalData={[7,8,4,7,8,4]}
                />
            </div>
            <div className="rate-comment flex flex-dir-col p-1">
                <div className="rate">
                    <h3>Average Rate <span>7.4</span></h3>
                </div>
                <div className='comment flex flex-dir-col'> 
                <h3>feedback</h3>
                    <p className="comment-text">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero perferendis dolor ullam sit doloremque tempora ex ab ad minus similique mol
                        litia maxime dicta consequuntur dolorum voluptatum dolore, aut quibusdam impedit?
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmpPerfo;