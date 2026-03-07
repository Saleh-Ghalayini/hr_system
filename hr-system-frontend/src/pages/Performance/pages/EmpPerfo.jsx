import React, { useEffect, useState } from 'react';
import MyChart from '../../../components/Chart';
import "./style.css";
import { request } from '../../../common/request';
import { toast } from 'react-toastify';

const EmpPerfo = () => {
    const [rates, setRates] = useState([5, 5, 5, 5, 5, 5]);
    const [labels, setLabels] = useState(["Team Work", "Communication", "Problem Handling", "Collaboration", "Creativity", "Reliability"]);
    const [comment, setComment] = useState("Feedback from your manager");
    const [average, setAverage] = useState(0);

    const getRate = async () => {
        try {
            const response = await request({
                method: "GET",
                path: "performance/my-rate",
            });
            if (response?.success && response.data) {
                const ratings = response.data.ratings ?? [];
                const rateNumbers = ratings.map(r => Number(r.rate));
                const rateLabels = ratings.map(r => r.type?.name ?? `Type ${r.type_id}`);

                setRates(rateNumbers);
                setLabels(rateLabels);
                setComment(response.data.comment ?? "");

                if (rateNumbers.length > 0) {
                    const avg = rateNumbers.reduce((sum, v) => sum + v, 0) / rateNumbers.length;
                    setAverage(avg.toFixed(2));
                }
            }
        } catch (error) {
            toast.error("Failed to load performance data.");
        }
    };

    useEffect(() => {
        getRate();
    }, []);

    return (
        <div className='performnce-container flex flex-dir-row p-1'>
            <div className='chart'>
                <MyChart
                    className={"mychart"}
                    label={"Employee Performance"}
                    labelsData={labels}
                    numericalData={rates}
                />
            </div>
            <div className="rate-comment flex flex-dir-col p-1">
                <div className="rate">
                    <h3>Average Rate <span>{average}</span></h3>
                </div>
                <div className='comment flex flex-dir-col'>
                    <h3>Feedback</h3>
                    <p className="comment-text">{comment}</p>
                </div>
            </div>
        </div>
    );
};

export default EmpPerfo;
