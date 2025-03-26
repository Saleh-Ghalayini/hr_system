import Table from "../../../components/Table";
import "./style.css";
import React, { useState, useEffect } from "react";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { request } from "../../../common/request";

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
        {key: 'check-in time', label: "check-in time"},
        {key: 'check-out time', label: "check-out time"},
        {key: 'location status', label: "location status"},
        {key: 'status', label: "status"},
        {key: 'hours worked', label: "hours worked"}
    ];

    const [attendance, setAttendance] = useState([]);

    const filter = async () => {
        try {
            
            if (name) {
                const [first_name, last_name] = name.split(" ");
                if((start_date) || (start_date && end_date)) {
                    const response = await request({
                        method: "GET",
                        path: "admin/attendance/user",
                        data: {
                            first_name: first_name,
                            last_name: last_name,
                            start_date: start_date,
                            end_date: end_date
                        },
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    console.log(first_name + " " + last_name + " " + " " + start_date + " " + end_date )
                    console.log(response);
                }
            }
        } catch(error) {
            console.log(error);
        }
    };
    

    const checkInOut = async () => {
        if (longitude === null || latitude === null) {
            console.error("Geolocation is not available.");
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
            })
            //console.log(response);
            //console.log("Token:", token);
            //console.log("Geolocation:", { latitude, longitude });

            setIsCheckedIn(!is_checked_in);
        } catch (error) {
            console.error("Error Response:", error.response?.data || error.message);
        }
        
    };

    const fetchAllUsersAttendances = async () => {
        try {
            const response = await request({
                method:"GET",
            path:"admin/attendance/all",
        headers:{
          Authorization : `Bearer ${token}`
        }
            });
            
            if (Array.isArray(response.attendance)) {   
                console.log("Stored Token:", token);
                const transformedData = response.attendance.map(item => ({
                    date: item.date || "N/A",
                    employee: item.full_name || "N/A",
                    "check-in time": item.check_in || "N/A",
                    "check-out time": item.check_out || "N/A",
                    "location status": item.loc_in_status || "N/A",
                    status: item.status || "N/A",
                    "hours worked": item.working_hours || "0hrs"
                }));
    
                setAttendance(transformedData);
            }

        } catch(error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchAllUsersAttendances();
      }, []);
    return <>
        <div className="attendance-records-container">
            <div className="filter-container">
                <div className="filter-inputs">
                <p>filter by:</p>
                <Input type="text" 
                    value={name} 
                    placeholder="Employee name" 
                    className=""
                    onChange={(e) => setName(e.target.value)}
                />
                <Input type="text" 
                    value={start_date} 
                    placeholder="specific or starting date" 
                    className=""
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <Input type="text" 
                    value={end_date} 
                    placeholder="Ending date" 
                    className=""
                    onChange={(e) => setEndDate(e.target.value)}
                />
                </div>
                <Button className="filter-btn" text="Filter" onClick={filter} />
                <Button className="check-btn" text={is_checked_in ? "Check Out" : "Check In"} onClick={checkInOut} />
            </div>
            <Table 
                headers={table_headers}
                data={attendance}
            />
        </div>
    </>
};

export default AttendanceRecords;