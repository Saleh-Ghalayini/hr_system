import React, { useEffect, useState } from 'react';
import Input from '../../../components/Input';
import PieChart from '../../../components/PieChart';
import "./style.css";
import Button from '../../../components/Button';
import { request } from '../../../common/request';
import { toast } from 'react-toastify';

const EmpRate = () => {
    const [rateValue, setValue] = useState({
        teamwork: 5,
        communication: 5,
        problemhandling: 5,
        collaboration: 5,
        creativity: 5,
        reliability: 5,
    });
    const [comment, setComment] = useState("");

    const getLatestRate = async () => {
        try {
            const response = await request({
                method: "GET",
                path: "performance/my-team-rate",
            });
            if (response.success && Array.isArray(response.data) && response.data.length >= 6) {
                const data = response.data;
                setValue({
                    teamwork: data[0].rate,
                    communication: data[1].rate,
                    problemhandling: data[2].rate,
                    collaboration: data[3].rate,
                    creativity: data[4].rate,
                    reliability: data[5].rate,
                });
            }
        } catch {
            toast.error("Failed to load team ratings.");
        }
    };

    const rateTeam = async () => {
        try {
            const response = await request({
                method: "POST",
                path: "performance/rate-team",
                data: {
                    type_ids: [1, 2, 3, 4, 5, 6],
                    rate: [
                        rateValue.teamwork,
                        rateValue.communication,
                        rateValue.problemhandling,
                        rateValue.collaboration,
                        rateValue.creativity,
                        rateValue.reliability,
                    ],
                    comment: comment,
                },
            });
            if (response.success) {
                toast.success("Team rated successfully!");
                setComment("");
            } else {
                toast.error("Failed to submit rating.");
            }
        } catch (error) {
            toast.error("Failed to submit rating.");
        }
    };

    useEffect(() => {
        getLatestRate();
    }, []);

    return (
        <>
            <div className='rate-container flex flex-dir-row flex-wrap mt'>
                <div className="inputs-container flex flex-dir-col justify-center align-center flex-grow-1">
                    <h2 className='subtitle p-1'>Rate Your Team</h2>
                    <div className='flex flex-dir-row flex-wrap flex-grow-1'>
                        <Input
                            label={"Team Work"}
                            type={"number"}
                            value={rateValue.teamwork}
                            onChange={(e) => {
                                const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                                setValue({ ...rateValue, teamwork: val });
                            }}
                            placeholder={"Rate 1~10"}
                        />
                        <Input
                            label={"Communication"}
                            type={"number"}
                            value={rateValue.communication}
                            onChange={(e) => {
                                const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                                setValue({ ...rateValue, communication: val });
                            }}
                            placeholder={"Rate 1~10"}
                        />
                        <Input
                            label={"Problem Handling"}
                            type={"number"}
                            value={rateValue.problemhandling}
                            onChange={(e) => {
                                const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                                setValue({ ...rateValue, problemhandling: val });
                            }}
                            placeholder={"Rate 1~10"}
                        />
                        <Input
                            label={"Collaboration"}
                            type={"number"}
                            value={rateValue.collaboration}
                            onChange={(e) => {
                                const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                                setValue({ ...rateValue, collaboration: val });
                            }}
                            placeholder={"Rate 1~10"}
                        />
                        <Input
                            label={"Creativity"}
                            type={"number"}
                            value={rateValue.creativity}
                            onChange={(e) => {
                                const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                                setValue({ ...rateValue, creativity: val });
                            }}
                            placeholder={"Rate 1~10"}
                        />
                        <Input
                            label={"Reliability"}
                            type={"number"}
                            value={rateValue.reliability}
                            onChange={(e) => {
                                const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                                setValue({ ...rateValue, reliability: val });
                            }}
                            placeholder={"Rate 1~10"}
                        />
                        <Input
                            label={"Comment"}
                            type={"text"}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={"Add a comment"}
                        />
                    </div>
                    <div>
                        <Button className='btn' text={"Rate"} onClick={rateTeam} />
                    </div>
                </div>
                <div className="piechart">
                    <PieChart
                        label={"Rates"}
                        numircalData={[
                            rateValue.teamwork,
                            rateValue.communication,
                            rateValue.problemhandling,
                            rateValue.collaboration,
                            rateValue.creativity,
                            rateValue.reliability,
                        ]}
                        dataLabels={["Team Work", "Communication", "Problem Handling", "Collaboration", "Creativity", "Reliability"]}
                    />
                </div>
            </div>
        </>
    );
};

export default EmpRate;
