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
    const [attendance, setAttendance] = useState([]);
    const [rawRecords, setRawRecords] = useState([]);

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
        { key: 'date', label: "Date" },
        { key: 'employee', label: "Employee name" },
        { key: 'check-in time', label: "Check-in time" },
        { key: 'check-out time', label: "Check-out time" },
        { key: 'location status', label: "Location status" },
        { key: 'status', label: "Status" },
        { key: 'hours worked', label: "Hours worked" }
    ];

    const checkInOut = async () => {
        if (longitude === null || latitude === null) {
            toast.error("Geolocation is not available.");
            return;
        }

        try {
            await request({
                method: "POST",
                path: is_checked_in ? "attendance/check-out" : "attendance/check-in",
                data: is_checked_in
                    ? { check_out_lon: longitude, check_out_lat: latitude }
                    : { check_in_lon: longitude, check_in_lat: latitude },
            });

            toast.success(is_checked_in ? "Checked Out Successfully!" : "Checked In Successfully!");
            setIsCheckedIn(!is_checked_in);
            fetchAllUsersAttendances();
        } catch (error) {
            toast.error("Error processing request.");
        }
    };

    const transformRecords = (records) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const todayStr = today.toISOString().split("T")[0];
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        return records.map(item => {
            const itemDate = item.date ? item.date.split("T")[0] : "N/A";
            return {
                date: itemDate === todayStr ? "Today" : itemDate === yesterdayStr ? "Yesterday" : itemDate,
                employee: item.full_name || "Employee name",
                "check-in time": item.check_in || "--:--",
                "check-out time": item.check_out || "--:--",
                "location status": item.loc_in_status || "N/A",
                status: item.time_in_status || "N/A",
                "hours worked": item.working_hours || "0hrs"
            };
        });
    };

    const fetchAllUsersAttendances = async () => {
        try {
            const response = await request({
                method: "GET",
                path: "admin/attendance/all",
            });
            const records = Array.isArray(response.data) ? response.data : [];
            setRawRecords(records);
            setAttendance(transformRecords(records));
        } catch {
            // silently fail — table stays empty
        }
    };

    const handleFilter = () => {
        let filtered = rawRecords;
        if (name.trim()) {
            const lower = name.toLowerCase();
            filtered = filtered.filter(item => (item.full_name || "").toLowerCase().includes(lower));
        }
        if (start_date) {
            filtered = filtered.filter(item => item.date && item.date.split("T")[0] >= start_date);
        }
        if (end_date) {
            filtered = filtered.filter(item => item.date && item.date.split("T")[0] <= end_date);
        }
        setAttendance(transformRecords(filtered));
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
                            type="date"
                            value={start_date}
                            placeholder="Start date"
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <Input
                            type="date"
                            value={end_date}
                            placeholder="End date"
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <Button className="filter-btn" text="Filter" onClick={handleFilter} />
                    <Button className="check-btn" text={is_checked_in ? "Check Out" : "Check In"} onClick={checkInOut} />
                </div>
                <Table headers={table_headers} data={attendance} />
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </>
    );
};

export default AttendanceRecords;
