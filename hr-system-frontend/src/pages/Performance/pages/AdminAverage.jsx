import { request } from '../../../common/request';
import MyChart from '../../../components/Chart';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const AdminAverage = () => {
    const [labels, setLabels] = useState([]);
    const [averageRateArray, setAverageRateArray] = useState([]);

    const averageRate = async () => {
        try {
            const response = await request({
                method: "GET",
                path: "performance/average",
            });
            if (response.success && Array.isArray(response.data)) {
                setLabels(response.data.map(r => r.type?.name ?? `Type ${r.type_id}`));
                setAverageRateArray(response.data.map(r => parseFloat(r.average_rate)));
            }
        } catch (error) {
            toast.error("Failed to load average ratings.");
        }
    };

    useEffect(() => {
        averageRate();
    }, []);

    return (
        <div className='users-container flex flex-dir-col p-1'>
            <h1>Average Rating for Employees</h1>
            <div className="average-chart mt">
                <MyChart
                    className={"mychart"}
                    label={"Employee Average Performance"}
                    labelsData={labels}
                    numericalData={averageRateArray}
                />
            </div>
        </div>
    );
};

export default AdminAverage;
