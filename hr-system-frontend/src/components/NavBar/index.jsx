import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import './style.css';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { request } from '../../common/request';
const NavBar = () => {
    const ImageBaseUrl = import.meta.env.VITE_Image_Base_URL;
    const [profile_url, setProfile] = useState("");
    const navigation = useNavigate();
    const location = useLocation();
    const title = location.pathname.split("/")[1] || "Dashboard";
    const getUrl = async ()=>{
        const token = localStorage.getItem("token");
        const response = await request({
            method:"GET",
            path:"getphotourl",
            headers:{
                Authorization : `Bearer ${token}`
            }
        })
        if(response.success){
            setProfile(ImageBaseUrl+response.photo_url);
        }
    }
    useEffect(()=>{
        getUrl()
    },[])
    return (
        <nav>
            <div className="title poppins">{title}</div>
            <div className='profile-section'>
            <Icon className='icons' icon="bi:bell-fill" width="20" height="20" />
            <Icon className='icons' icon="ic:baseline-settings" width="24" height="24" />
            <img src={profile_url} alt="Profile picture" onClick={()=>navigation("/profile/")} />            
            </div>
        </nav>
    );
};

export default NavBar;