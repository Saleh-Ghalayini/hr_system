import Table from "../../../components/Table";
import "./style.css";
import React, { useState, useEffect } from "react";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { request } from "../../../common/request";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AttendanceRecords = () => {
    
    const [longitude, setLongitude] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [is_checked_in, setIsCheckedIn] = useState(false);
    const [name, setName] = useState("");
    const [start_date, setStartDate] = useState("");
    const [end_date, setEndDate] = useState("");

    const token = localStorage.getItem("token");

    const getLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            },
            (error) => {
                console.error("Error getting location:", error);
            }
        );
    };

    useEffect(() => {
        getLocation();
    }, []);

    const table_headers = [
        {key: 'date', label: "Date"},
        {key: 'employee', label: "Employee name"},
        {key: 'check-in time', label: "Check-in time"},
        {key: 'check-out time', label: "Check-out time"},
        {key: 'location status', label: "Location status"},
        {key: 'status', label: "Status"},
        {key: 'hours worked', label: "Hours worked"}
    ];

    const [attendance, setAttendance] = useState([]);

    const checkInOut = async () => {
        if (longitude === null || latitude === null) {
            toast.error("Geolocation is not available.");
            return;
        }
    
        try {
            const [first_name, last_name] = name.split(" ");
            const response = await request({
                method: "POST",
                path: is_checked_in ? "admin/attendance/check-out" : "admin/attendance/check-in",
                data: is_checked_in
                    ? {
                        check_out_lon: longitude,
                        check_out_lat: latitude,
                        first_name: first_name,
                        last_name: last_name
                    }
                    : {
                        check_in_lon: longitude,
                        check_in_lat: latitude,
                        first_name: first_name,
                        last_name: last_name
                    },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            toast.success(is_checked_in ? "Checked Out Successfully!" : "Checked In Successfully!");
    
            setIsCheckedIn(!is_checked_in);
    
            fetchAllUsersAttendances();
    
        } catch (error) {
            toast.error("Error processing request.");
            console.error("Error Response:", error.response?.data || error.message);
        }
    };
    
    const fetchAllUsersAttendances = async () => {
        try {
            const response = await request({
                method: "GET",
                path: "admin/attendance/all",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            if (Array.isArray(response.attendance)) {
                const today = new Date();
                const yesterday = new Date();
                yesterday.setDate(today.getDate() - 1);
    
                const todayStr = today.toISOString().split("T")[0];
                const yesterdayStr = yesterday.toISOString().split("T")[0];
                
                const transformedData = response.attendance.map(item => {
                    const itemDate = item.date ? item.date.split("T")[0] : "N/A";
    
                    return {
                        date: itemDate === todayStr ? "Today" : itemDate === yesterdayStr ? "Yesterday" : itemDate,
                        employee: item.full_name || "Employee name",
                        "check-in time": item.check_in || "--:--",
                        "check-out time": item.check_out || "--:--",
                        "location status": item.loc_in_status || "N/A",
                        status: item.status || "N/A",
                        "hours worked": item.working_hours || "0hrs"
                    };
                });
    
                setAttendance(transformedData);
            }
    
        } catch(error) {
            console.log(error);
        }
    };
    
    

    useEffect(() => {
        fetchAllUsersAttendances();
    }, []);

    return (
        <>
            <div className="attendance-records-container">
                <div className="filter-container">
                    <div className="filter-inputs">
                        <p>Filter by:</p>
                        <Input 
                            type="text" 
                            value={name} 
                            placeholder="Employee name" 
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input 
                            type="text" 
                            value={start_date} 
                            placeholder="Specific or starting date" 
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <Input 
                            type="text" 
                            value={end_date} 
                            placeholder="Ending date" 
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <Button className="filter-btn" text="Filter" onClick={fetchAllUsersAttendances} />
                    <Button className="check-btn" text={is_checked_in ? "Check Out" : "Check In"} onClick={checkInOut} />
                </div>
                <Table headers={table_headers} data={attendance} />
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </>
    );
};

export default AttendanceRecords;
