import axios from "axios";

export const baseApi =import.meta.env.VITE_Base_API;;

export const request = async ({method,path,data,headers})=>{

try {
    const response = await axios({
        method,
        url: baseApi+path,
        data,
        headers,
    })
    return response.data;
} catch (error) {
    console.log(error);
}

}
